var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require('./users')
const postModel = require('./post')
const upload = require('./multer')
const localStrategey = require('passport-local')
passport.use(new localStrategey(userModel.authenticate()))

// Login Page
router.get('/', function(req, res) {
  res.render('index',{nav:false});
});

// Login Post Page
router.post('/login',passport.authenticate("local",{
  failureRedirect: '/',
  successRedirect: '/profile'
}), function(req, res) {
  

});

// Register Page
router.get('/register', function(req, res) {
  res.render('register',{nav:false})
});

// Register Post Page
router.post('/register', function(req, res) {
  const { email, username, password, contact } = req.body
  const userdata = userModel({
    email,
    username ,
    contact,
  })
  userModel.register(userdata, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/')
    })
  })

});

// Profile Page
router.get('/profile', isLoggedIn, async function(req, res,next) {
  const user  = 
  await userModel
    .findOne({username: req.session.passport.user})
    .populate("posts")
    res.render('profile',{user, nav:true})
});

// Show Page
router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user  = 
  await userModel
    .findOne({username: req.session.passport.user})
    .populate("posts")
    res.render('show',{user, nav:true})
});

// Feed Page
router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user  = await userModel.findOne({username: req.session.passport.user})
  const posts  = await postModel.find()
  .populate("user")
  res.render("feed",{user,posts,nav:true})
});

// Add Page
router.get('/add', isLoggedIn, async function(req, res) {
  const user  = await userModel.findOne({username: req.session.passport.user})
  res.render('add',{user, nav:true})
});

//  createpost  Post 
router.post('/createpost', isLoggedIn, upload.single('postimage') ,async function(req, res) {
  const user  = await userModel.findOne({username: req.session.passport.user})
  const post  = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
});

// Fileupload Post Page
router.post('/fileupload', isLoggedIn, upload.single('image'), async function(req, res,next) {
  const user  = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect('/profile')
});

//  Edit
router.get('/edit', isLoggedIn, async function(req, res,next) {
  const user  = await userModel.findOne({username: req.session.passport.user})
  res.render('edit',{user , nav:false});
});


// Edit profile Updates
router.post("/updateprofile", isLoggedIn, upload.single("image"), async (req, res) => {
 
  try {
    const user  = await userModel.findOne({username: req.session.passport.user})  // Ensure you're getting the ID from the session user
    const { username, email, contact } = req.body;
    let updateData = { username, email, contact };

    // Check if a new profile image was uploaded
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    // Update the user's profile in the database
    await userModel.updateOne({ _id: user._id }, updateData);

    // Redirect to the profile page after successful update
    res.redirect('/profile')
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Error updating profile");
  }   
});











//  Logout Process

router.get('/logout', function(req,res,next){
  req.logout(function(err){
    if(err){ return next(err)}
    res.redirect('/')
  })
})


//  Middleware
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/")
}
module.exports = router;

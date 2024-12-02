require('dotenv').config();


const mongoose = require('mongoose')
const plm  = require("passport-local-mongoose")

const mongoURL = process.env.NODE_ENV === "production" ? process.env.MONGO_URL_PROD : process.env.MONGO_URL_LOCAL;


mongoose.connect(mongoURL)
console.log("DB Connected");


const userSchema = mongoose.Schema({
  email : String,
  username : String,
  password : String,
  profileImage : String,
  contact : Number,
  boards: {
    type:Array,
    default:[]
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }]
})

userSchema.plugin(plm)

module.exports = mongoose.model("user",userSchema)
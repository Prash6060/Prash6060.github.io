const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    voterID:{
     type:String,
     required:true
    },
    hasVoted : {
      type : Boolean,
      required : true
    }
})

module.exports = mongoose.model("User",userSchema);

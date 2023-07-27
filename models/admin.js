const mongoose = require('mongoose')
const adminSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Admin",adminSchema);

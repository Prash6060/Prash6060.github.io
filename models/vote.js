//make vote schema
const mongoose = require('mongoose')

const voteSchema = new mongoose.Schema({
    timestamp:{
        type:String,
        required:true
    },
    lastHash:{
        type:String,
        required:true
    },
    hash:{
        type:String,
        required:true
    },
    data:{
     type:String,
     required:true
    },
    nonce : {
      type : String,
      required : true
    }
})

module.exports = mongoose.model("Vote",voteSchema);

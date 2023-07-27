
const mongoose = require('mongoose')

const elecSchema = new mongoose.Schema({
    name: {
      type:String,
      required : true
    },
    status:{
        type:Boolean,
        required:true
    }
})

module.exports = mongoose.model("Elec",elecSchema);

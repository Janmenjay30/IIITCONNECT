const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // channel id or private room id
  text: { type: String, required: true },
  // Reference the user instead of saving their name/ID as a string
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true }); // Using timestamps is a bit cleaner

module.exports = mongoose.model("Message", messageSchema);
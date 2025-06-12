const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: String, // channel id or private room id
  text: String,
  username: String,
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
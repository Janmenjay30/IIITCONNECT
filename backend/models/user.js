const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  skills: [{ type: String }],
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  // Inside userSchema
privateChats: [
  {
    // Just store the ID of the person you're chatting with
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    // The unique room ID for this private chat
    roomId: { type: String}, 
  },
],
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'creator',
});

module.exports = mongoose.model("User", userSchema);
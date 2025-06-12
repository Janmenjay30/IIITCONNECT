const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  skills: [{ type: String }],
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  privateChats: [
    {
      chatUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ID of the user in the private chat
      chatUserName: { type: String }, // Name of the user in the private chat
      chatUserEmail: { type: String }, // Email of the user in the private chat
      roomId: { type: String }, // Unique room ID for the private chat
    },
  ],
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'creator',
});

module.exports = mongoose.model("User", userSchema);
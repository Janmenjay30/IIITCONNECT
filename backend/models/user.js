const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  skills: [{ type: String }],
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
},{toJSON:{virtuals:true},toObject:{virtual:true}});

userSchema.virtual('projects',{
  ref:'Project',
  localField:'_id',
  foreignField:'creator',

});

module.exports = mongoose.model("User", userSchema);
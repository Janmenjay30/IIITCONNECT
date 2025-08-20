const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  skills: [{ type: String }],
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  
  // ✅ ADD THESE NEW FIELDS FOR OTP VERIFICATION
  isEmailVerified: { type: Boolean, default: false },
  accountStatus: { 
    type: String, 
    enum: ['pending', 'active', 'suspended'], 
    default: 'pending' 
  },
  emailOTP: { type: String, default: null },
  emailOTPExpires: { type: Date, default: null },
  
  privateChats: [
    {
      partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
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
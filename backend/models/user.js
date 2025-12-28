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
  
// Single-field index + unique for email (explicit)
// NOTE: `email` already declares `unique: true` in the schema above, which creates an index.
// Keeping a second explicit index definition causes Mongoose's "Duplicate schema index" warning.

// Multikey index for skills (array field)
userSchema.index({ skills: 1 }, { background: true });

// Compound index for accountStatus + isEmailVerified
userSchema.index({ accountStatus: 1, isEmailVerified: 1 }, { background: true });

// Optional: TTL index for OTP expiry to automatically remove expired OTP docs
// This only works if you want documents to be removed after `emailOTPExpires`. 
// If you only want to query by expiry time (not auto-delete), don’t add this.
userSchema.index({ emailOTPExpires: 1 }, { expireAfterSeconds: 0, background: true });

module.exports = mongoose.model("User", userSchema);
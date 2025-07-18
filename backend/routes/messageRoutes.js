const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const authMiddleware=require('../middleware/authMiddleware')
const User=require('../models/user')

// Search users by name or email
// router.get('/search', authMiddleware, async (req, res) => {
//   const query = req.query.query || "";
//   try {
//     const users = await User.find({
//       $or: [
//         { name: { $regex: query, $options: "i" } },
//         { email: { $regex: query, $options: "i" } }
//       ]
//     }).select("_id name email");
//     res.json(users);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Failed to search users" });
//   }
// });

// Get messages for a room
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 }) // Optional: sort messages by time
      .populate('sender', 'name email'); // This is the crucial part

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});



module.exports = router;
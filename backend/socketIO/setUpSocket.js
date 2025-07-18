const { Server } = require("socket.io");

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    // Join a room (public channel or private DM)
    socket.on("join room", (roomId) => {
      socket.join(roomId);
    });

    // Handle chat messages
    socket.on("chat message", (msg) => {
      // Save message to DB here if needed
      io.to(msg.room).emit("chat message", msg);
    });
  });

  return io;
}


module.exports = setupSocket;
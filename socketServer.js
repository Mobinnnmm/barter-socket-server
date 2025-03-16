const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { connectToDB } = require("./lib/mongodb");
require("./models/Message"); 
require("./models/User"); 

async function initializeSocketServer(httpServer) {
  console.log("📡 Attempting MongoDB connection...");
  await connectToDB();
  console.log("✅ MongoDB connected successfully for Socket.IO server");

  console.log("⚙️  Configuring Socket.IO server...");
  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000", // this will be changed with the frontend deployed link
      methods: ["GET", "POST"],
    },
  });

  const activeConnections = new Map();
  console.log("✨ Socket.IO server configured successfully");

  io.on("connection", (socket) => {
    const { userId, roomId } = socket.handshake.query;

    console.log("━━━━━━━━━━━ New Connection ━━━━━━━━━━━");
    console.log(`👤 User ID: ${userId}`);
    console.log(`🏠 Room ID: ${roomId}`);
    console.log(`🔌 Socket ID: ${socket.id}`);

    // Join the room
    socket.join(roomId);
    activeConnections.set(socket.id, { userId, roomId });
    console.log(`✅ User successfully joined room ${roomId}`);
    console.log(`👥 Total active connections: ${activeConnections.size}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Handle incoming messages
    socket.on("sendMessage", async (messageData) => {
      console.log("━━━━━━━━━━━ New Message ━━━━━━━━━━━");
      console.log(`📨 From User: ${userId}`);
      console.log(`📝 Content: ${messageData.content}`);

      try {
        if (mongoose.connection.readyState !== 1) {
          console.log("🔄 Reconnecting to MongoDB...");
          await connectToDB();
        }

        const Message = mongoose.model("Message");
        console.log("💾 Saving message to database...");

        const newMessage = new Message({
          ...messageData,
          senderId: new mongoose.Types.ObjectId(messageData.senderId),
        });

        const savedMessage = await newMessage.save();
        console.log("✅ Message saved successfully");

        const populatedMessage = await Message.findById(savedMessage._id).populate(
          "senderId",
          ["_id", "username"]
        );

        console.log("📤 Broadcasting message to room...");
        io.to(roomId).emit("receiveMessage", populatedMessage);
        console.log("✅ Message broadcast complete");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      } catch (error) {
        console.error("❌ Error handling message:");
        console.error(error);
        socket.emit("messageError", {
          error: "Failed to save message",
          details: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("━━━━━━━━━━━ Disconnection ━━━━━━━━━━━");
      const userData = activeConnections.get(socket.id);
      activeConnections.delete(socket.id);
      console.log(`👋 User ${userId} disconnected from room ${roomId}`);
      console.log(`👥 Remaining active connections: ${activeConnections.size}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  });

  return io;
}

module.exports = { initializeSocketServer };
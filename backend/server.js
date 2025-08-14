import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Message from "./models/Message.js"; // your schema

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Step 1: Join a room
  socket.on("joinRoom", async ({ room, alias }) => {
    socket.join(room);
    console.log(`👤 ${alias} joined room: ${room}`);

    // Send old messages for this room only
    const oldMessages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("loadMessages", oldMessages);
  });

  // Step 2: Send message
  socket.on("sendMessage", async ({ room, alias, text }) => {
    const newMsg = new Message({ room, alias, text });
    await newMsg.save();

    // Broadcast only to users in that room
    io.to(room).emit("message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Campus Room API is running 🚀");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

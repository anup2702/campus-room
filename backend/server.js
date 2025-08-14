import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Message from "./models/Message.js";

dotenv.config();

const app = express();

// CORS for Express
app.use(cors({
  origin: process.env.FRONTEND_URL, // Vercel frontend URL
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection failed:", err));

const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["polling"], // avoid WebSocket issues on Railway free
  allowEIO3: true
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Join a room
  socket.on("joinRoom", async ({ room, alias }) => {
    if (!room || !alias) return;

    socket.join(room);
    console.log(`👤 ${alias} joined room: ${room}`);

    // Send old messages in this room
    const oldMessages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("loadMessages", oldMessages);
  });

  // Send message
  socket.on("sendMessage", async ({ room, alias, text }) => {
    if (!room || !alias || !text) return;

    const newMsg = new Message({ room, alias, text });
    await newMsg.save();

    // Broadcast to room
    io.to(room).emit("message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Test route
app.get("/", (req, res) => res.send("Campus Room API is running 🚀"));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

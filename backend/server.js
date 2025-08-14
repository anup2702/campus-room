import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Message from "./models/Message.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection failed:", err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["polling"],
  allowEIO3: true
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("joinRoom", async ({ room, alias }) => {
    if (!room || !alias) return;

    socket.join(room);
    console.log(`👤 ${alias} joined room: ${room}`);

    const oldMessages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("loadMessages", oldMessages.map(msg => msg.toObject()));
  });

  socket.on("sendMessage", async ({ room, alias, text }) => {
    if (!room || !alias || !text) return;

    const newMsg = new Message({ room, alias, text });
    await newMsg.save();

    // Emit full message including _id
    io.to(room).emit("message", newMsg.toObject());
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("Campus Room API is running 🚀"));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

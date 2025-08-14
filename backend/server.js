require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const generateAlias = require("./utils/aliasGenerator");
const rateLimiter = require("./utils/rateLimiter");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  const alias = generateAlias();
  console.log(`🔗 New user connected: ${alias}`);

  socket.on("join_room", async (room) => {
    socket.join(room);
    const lastMessages = await Message.find({ room }).sort({ timestamp: 1 }).limit(100);
    socket.emit("load_messages", lastMessages);
  });

  socket.on("send_message", async ({ room, text }) => {
    if (!rateLimiter(socket.id)) {
      return socket.emit("error_message", "Rate limit exceeded. Slow down!");
    }

    const msg = new Message({ room, alias, text });
    await msg.save();
    io.to(room).emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${alias}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

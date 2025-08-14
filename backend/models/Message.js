const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  alias: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: { expires: "24h" } }
});

module.exports = mongoose.model("Message", messageSchema);

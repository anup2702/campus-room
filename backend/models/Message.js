import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  alias: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: { expires: "24h" } }
});

export default mongoose.model("Message", messageSchema);

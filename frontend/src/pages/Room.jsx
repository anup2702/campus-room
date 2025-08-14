import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";
const socket = io(backendURL);

export default function Room({ room, alias }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Join the room on mount
    socket.emit("joinRoom", { room, alias });

    socket.on("loadMessages", (msgs) => setMessages(msgs));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("loadMessages");
      socket.off("message");
    };
  }, [room, alias]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("sendMessage", { room, alias, text: input });
      setInput("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.alias}:</strong> {msg.text}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

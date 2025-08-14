import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const backendURL =
  import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";

const socket = io(backendURL);

export default function Room() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to backend:", socket.id);
    });

    socket.on("message", (data) => {
      console.log("📩 Message from backend:", data);
      setMessages((prev) => [...prev, data]); // Add to UI
    });

    // cleanup on unmount
    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Backend URL
const backendURL =
  import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";

// Socket.IO client
const socket = io(backendURL, {
  transports: ["polling"], // avoid WebSocket issues
  upgrade: true
});

export default function Room({ room, alias }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!room || !alias) return;

    // Join room
    socket.emit("joinRoom", { room, alias });
    console.log("Joining room:", room, alias);

    // Load old messages
    socket.on("loadMessages", (msgs) => setMessages(msgs));

    // New messages
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
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Room: {room}</h2>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          height: "400px",
          overflowY: "scroll",
          marginBottom: "10px",
          background: "#f9f9f9"
        }}
      >
        {messages.map((msg) => (
          <p key={msg._id}>
            <strong>{msg.alias}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          style={{ flex: 1, padding: "8px" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

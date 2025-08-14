import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Backend URL
const backendURL =
  import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";

export default function Room({ room, alias }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!room || !alias) return;

    // Initialize socket inside useEffect
    const socket = io(backendURL, {
      transports: ["polling"],
      upgrade: true
    });

    socketRef.current = socket;

    // Join room
    socket.emit("joinRoom", { room, alias });

    // Load old messages
    socket.on("loadMessages", (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    // Listen for new messages
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [room, alias]);

  const sendMessage = () => {
    if (input.trim()) {
      socketRef.current.emit("sendMessage", { room, alias, text: input });
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
        <div ref={messagesEndRef} />
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

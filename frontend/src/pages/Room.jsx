import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// const backendURL =
//   import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";
const backendURL = "https://campus-room-production.up.railway.app";

export default function Room({ room, alias }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!room || !alias) return;

    const socket = io(backendURL, {
      transports: ["polling"],
      upgrade: true
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ Connected:", socket.id);
      socket.emit("joinRoom", { room, alias });
    });

    socket.on("loadMessages", (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [room, alias]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [connected]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current || !connected) return;

    socketRef.current.emit("sendMessage", { room, alias, text: trimmed });
    setInput("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Room: {room}</h2>
      <p style={{ fontSize: "14px", color: connected ? "green" : "red", marginBottom: "10px" }}>
        {connected ? "Connected ✅" : "Connecting... 🔄"}
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
          marginBottom: "10px",
          background: "#f9f9f9"
        }}
      >
        {messages.map((msg) => (
          <div key={msg._id || `${msg.alias}-${msg.timestamp}`} style={{ marginBottom: "8px" }}>
            <div style={{ fontWeight: "bold" }}>{msg.alias}</div>
            <div>{msg.text}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          ref={inputRef}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={connected ? "Type a message..." : "Connecting..."}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            backgroundColor: connected && input.trim() ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            cursor: connected && input.trim() ? "pointer" : "not-allowed"
          }}
          disabled={!connected || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

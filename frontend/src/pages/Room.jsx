import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const backendURL =
  import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";

export default function Room({ room, alias }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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
      console.log("Socket connected:", socket.id);
      socket.emit("joinRoom", { room, alias });
    });

    socket.on("loadMessages", (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    socket.on("message", (msg) => {
      console.log("Received message:", msg); // Debug log
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [room, alias]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !connected) return;
    socketRef.current.emit("sendMessage", { room, alias, text: input });
    setInput("");
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
          <p key={msg._id || `${msg.alias}-${msg.timestamp}`}>
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
          placeholder={connected ? "Type a message" : "Connecting..."}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{ padding: "8px 16px" }}
          disabled={!connected || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

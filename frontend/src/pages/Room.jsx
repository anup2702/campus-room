import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// const backendURL =
//   import.meta.env.VITE_API_URL || "https://campus-room-production.up.railway.app";
const backendURL = "https://campus-room-production.up.railway.app";

const socket = io(backendURL);


export default function Room({ room, alias }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

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
      console.log("🔌 Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [room, alias]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current) return;

    socketRef.current.emit("sendMessage", { room, alias, text: trimmed });
    setInput("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans bg-gray-900 text-white min-h-screen flex flex-col">
      <h2 className="text-3xl font-bold mb-4 text-center">Room: {room}</h2>
      <p className="text-sm text-green-500 mb-4 text-center">
        Connected ✅
      </p>

      <div
        className="border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-800 flex-grow"
      >
        {messages.map((msg) => (
          <div key={msg._id || `${msg.alias}-${msg.timestamp}`} className="mb-3">
            <div className="font-semibold text-blue-400">{msg.alias}</div>
            <div className="text-gray-200">{msg.text}</div>
            <div className="text-xs text-gray-500">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 p-3 rounded-lg border border-gray-700 text-base bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Type a message..."}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className={`px-5 py-3 rounded-lg bg-blue-600 text-white border-none cursor-pointer transition duration-200 ease-in-out ${!input.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

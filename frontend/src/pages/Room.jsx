import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const backendURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(backendURL);


export default function Room() {
  const { name } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.emit("join_room", name);

    socket.on("load_messages", (msgs) => setMessages(msgs));
    socket.on("receive_message", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [name]);

  const sendMessage = () => {
    if (text.trim()) {
      socket.emit("send_message", { room: name, text });
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-bold">{m.alias}: </span>{m.text}
          </div>
        ))}
      </div>
      <div className="p-4 flex">
        <input
          className="flex-1 p-2 rounded bg-gray-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="ml-2 px-4 bg-blue-600 rounded">Send</button>
      </div>
    </div>
  );
}

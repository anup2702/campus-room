import { Link } from "react-router-dom";
import { FaLaughBeam, FaBookOpen, FaUserSecret, FaComments } from "react-icons/fa";

const rooms = [
  { name: "fun", label: "Fun", desc: "Jokes, memes & laughter", color: "from-pink-500 to-orange-500", icon: <FaLaughBeam size={32} /> },
  { name: "study", label: "Study", desc: "Notes & academic help", color: "from-blue-500 to-indigo-500", icon: <FaBookOpen size={32} /> },
  { name: "confession", label: "Confession", desc: "Secrets & confessions", color: "from-purple-500 to-pink-500", icon: <FaUserSecret size={32} /> },
  { name: "general", label: "General", desc: "Casual everyday talk", color: "from-green-500 to-teal-500", icon: <FaComments size={32} /> }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white py-12 px-4">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-2">CampusRooms</h1>
      <p className="text-gray-400 mb-10 text-center">Join a room and chat anonymously in real-time</p>

      {/* Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {rooms.map((room) => (
          <Link
            key={room.name}
            to={`/room/${room.name}`}
            className={`bg-gradient-to-br ${room.color} rounded-xl p-6 shadow-lg transform transition hover:scale-105`}
          >
            <div className="flex flex-col items-start space-y-3">
              <div className="p-3 bg-white/20 rounded-full">{room.icon}</div>
              <h2 className="text-2xl font-semibold">{room.label}</h2>
              <p className="text-sm text-white/80">{room.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 mt-10">No login needed · 100% anonymous</p>
    </div>
  );
}

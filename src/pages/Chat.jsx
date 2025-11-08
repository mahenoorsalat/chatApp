import { useState, useEffect, useRef } from "react";

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const scrollRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;

    const newMessage = {
      text: msg,
      user: user?.name || "Anonymous",
      userPhoto:
        user?.photo ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png", // default avatar
    };

    setMessages((prev) => [...prev, newMessage]);
    setMsg("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-md border p-5">
      <h2 className="text-xl font-semibold mb-4 text-center">💬 Chat Room</h2>

      <div className="h-72 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 italic">No messages yet...</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 mb-3 ${
                m.user === user?.name ? "justify-end" : ""
              }`}
            >
              {m.user !== user?.name && (
                <img
                  src={m.userPhoto}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div
                className={`p-2 rounded-lg max-w-[75%] ${
                  m.user === user?.name
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <strong className="block text-sm">{m.user}</strong>
                <span>{m.text}</span>
              </div>
              {m.user === user?.name && (
                <img
                  src={m.userPhoto}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 mt-4">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}

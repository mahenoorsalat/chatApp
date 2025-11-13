import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Initialize Socket.IO connection
const socket = io("http://localhost:5000");

// --- UserList Component ---
const UserList = ({ currentUser, users, selectUser, selectedUser }) => {
  // Filter out the current user from the list
  const filteredUsers = users.filter((u) => u.id !== currentUser?.id);
  
  return (
    <div className="w-full sm:w-1/3 border-r border-gray-200 p-4 bg-gray-100 rounded-l-2xl">
      <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">Active Users</h3>
      <ul className="space-y-2 max-h-[30rem] overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No other users found.</p>
        ) : (
          filteredUsers.map((u) => (
            <li
              key={u.id}
              onClick={() => selectUser(u)}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                selectedUser?.id === u.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-blue-100 bg-white"
              }`}
            >
              <img
                src={u.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <span className="font-medium truncate">{u.name}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

// --- Chat Component (Parent) ---
export default function Chat({ user }) {
  // State for messages in the currently selected chat
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [allUsers, setAllUsers] = useState([]); // NEW: State for all users
  const [selectedUser, setSelectedUser] = useState(null); // NEW: State for selected chat partner
  const scrollRef = useRef(null);

  // Function to select a user
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages([]); // Clear messages when switching users
  };
  
  // 1. Fetch All Users on Component Load
  useEffect(() => {
    const fetchAllUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // NOTE: This assumes you create a new backend endpoint /api/user/all
        const res = await axios.get("http://localhost:5000/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // The API should return an array of user objects: [{ id, name, photo }]
        setAllUsers(res.data.users); 
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchAllUsers();
  }, [user]); // Re-run if the current user object changes

  // 2. Fetch Private Chat History when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !user) return;

    const fetchPrivateHistory = async () => {
        const token = localStorage.getItem("token");
        try {
            // NOTE: This assumes a new backend route for private history
            const res = await axios.get(`http://localhost:5000/api/chat/history/private/${selectedUser.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Map the fetched data structure
            const history = res.data.map(m => ({
                text: m.content,
                // Determine who sent the message for styling/display
                user: m.sender.username, 
                userPhoto: m.sender.photoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }));
            setMessages(history);

        } catch (err) {
            console.error("Error fetching private chat history:", err);
            setMessages([]);
        }
    };

    fetchPrivateHistory();
  }, [selectedUser, user]); 

  // 3. Socket Setup for Private Messages
  useEffect(() => {
    if (!user) return;

    // A. Inform the server of the current user's socket ID (for private messaging)
    socket.emit('setOnline', user.id); 

    // B. Listen for private messages (from the selected user)
    socket.on('privateMessage', (m) => {
        // Only show messages that are from the currently selected user
        // OR messages that the current user sent (which the server echoes back)
        if (m.senderId === selectedUser?.id || m.recipientId === selectedUser?.id) {
            const newMessage = {
                text: m.content,
                user: m.senderName,
                userPhoto: m.senderPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            };
            setMessages((prev) => [...prev, newMessage]);
        }
    });

    // Clean up
    return () => {
        socket.off('privateMessage');
    };
  }, [user, selectedUser]); // Dependent on user and which chat is open

  // Scroll to bottom on message update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send Message Logic ---
  const sendMessage = (e) => {
    e.preventDefault();
    const messageContent = msg.trim();
    if (!messageContent || !user || !selectedUser) return;

    const messageData = {
      content: messageContent,
      senderId: user.id,
      senderName: user.name || "Anonymous",
      senderPhoto: user.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      recipientId: selectedUser.id, // NEW: Include recipient ID
      recipientName: selectedUser.name,
    };
    
    // Emit the message to the server's private message event
    // NOTE: This assumes you change the backend socket event name to 'sendPrivateMessage'
    socket.emit('sendPrivateMessage', messageData);

    // Optimistically add the message to the sender's local state
    setMessages((prev) => [...prev, {
        text: messageContent,
        user: messageData.senderName,
        userPhoto: messageData.senderPhoto,
    }]);

    setMsg("");
  };

  // --- JSX Rendering ---
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-xl border flex h-[40rem]">
      
      <UserList 
        currentUser={user} 
        users={allUsers} // Use the fetched users
        selectUser={handleSelectUser} 
        selectedUser={selectedUser} 
      />

      {/* Main Chat Area */}
      <div className="flex-1 p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-center border-b pb-2 text-gray-800">
            {selectedUser ? `💬 Chat with ${selectedUser.name}` : "Select a user to begin"}
        </h2>
        
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50 mb-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 italic mt-10">Say hello to {selectedUser.name}!</p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 mb-3 ${
                      m.user === user?.name ? "justify-end" : ""
                    }`}
                  >
                    {/* Show recipient's avatar on the left */}
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
                      <strong className="block text-xs font-semibold">
                          {m.user === user?.name ? "You" : m.user}
                      </strong>
                      <span>{m.text}</span>
                    </div>
                    {/* Show current user's avatar on the right */}
                    {m.user === user?.name && ( 
                      <img
                        src={m.user?.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Type your message to ${selectedUser.name}...`}
                className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <p className="text-center text-gray-500 italic mt-10">
            Select a user from the left pane to start a private chat.
          </p>
        )}
      </div>
    </div>
  );
}
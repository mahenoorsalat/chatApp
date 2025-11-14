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
                // FIXED: Use 'photoUrl' for consistency
                src={u.photoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <span className="font-medium truncate">
                {/* FIXED: Use 'username' for consistency */}
                {u.username}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

// --- Chat Component (Parent) ---
export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [allUsers, setAllUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const scrollRef = useRef(null);
  const [onlineUsers , setOnlineUsers] = useState([]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages([]); 
  };
  
  // 1. Fetch All Users on Component Load
  useEffect(() => {
const fetchUsers = async () => {
   const token = localStorage.getItem("token");
   try{
      const res = await axios.get("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(res.data.users);
    }catch(err){
      console.error("Error fetching users:", err);
      setAllUsers([]);
    }
  };
  if(user){
    fetchUsers();
   }

  }, [user]);

  // 2. Fetch Private Chat History when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !user) return;

    const fetchPrivateHistory = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`http://localhost:5000/api/chat/history/private/${selectedUser.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
  
            setMessages(res.data);

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

    socket.emit('setOnline', user.id); 

    socket.on('privateMessage', (m) => {
      
        const isFromSelectedUser = m.sender._id === selectedUser?.id;
        const isToSelectedUser = m.recipient?._id === selectedUser?.id;

        if (isFromSelectedUser || (m.sender._id === user.id && isToSelectedUser)) {
            setMessages((prev) => [...prev, m]);
        }
    });

    // Clean up
    return () => {
        socket.off('privateMessage');
    };
  }, [user, selectedUser]); // Keep selectedUser here to ensure the listener uses the correct closure for filtering

  // Scroll to bottom on message update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return ()=> socket.off("onlineUsers");
  }, []);

  const availableUser = ()=>{
    if(!selectedUser) return "";
    return onlineUsers.includes(selectedUser.id) ? "Online" : "Offline";
  }

  // --- Send Message Logic ---
  const sendMessage = (e) => {
    e.preventDefault();
    const messageContent = msg.trim();
    if (!messageContent || !user || !selectedUser) return;

    const messageData = {
      content: messageContent,
      senderId: user.id,
      // FIXED: Use 'username' and 'photoUrl' consistently
      senderName: user.username || "Anonymous",
      senderPhoto: user.photoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png", 
      recipientId: selectedUser.id, 
      recipientName: selectedUser.username,
    };
    
    // Emit the message to the server's private message event
    socket.emit('sendPrivateMessage', messageData);

    setMsg("");
  };

  // --- JSX Rendering ---
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-xl border flex h-[40rem]">
      
      <UserList 
        currentUser={user} 
        users={allUsers} 
        selectUser={handleSelectUser} 
        selectedUser={selectedUser} 
      />

      {/* Main Chat Area */}
      <div className="flex-1 p-5 flex flex-col">
       <h2 className="text-xl font-bold mb-4 text-center border-b pb-2 text-gray-800">
  {selectedUser 
      ? `💬 Chat with ${selectedUser.username} — ${availableUser()}` 
      : "Select a user to begin"}
</h2>

        
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50 mb-4">
              {messages.length === 0 ? (
                // FIXED: Use 'username'
                <p className="text-center text-gray-500 italic mt-10">Say hello to {selectedUser.username}!</p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    // FIXED: Check against sender's ID (m.sender._id) as that is populated from the DB
                    className={`flex items-start gap-2 mb-3 ${
                      m.sender._id === user?.id ? "justify-end" : ""
                    }`}
                  >
                    {/* Show recipient's avatar on the left */}
                    {/* FIXED: Check against sender's ID */}
                    {m.sender._id !== user?.id && ( 
                      <img
                        src={m.sender.photoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div
                      className={`p-2 rounded-lg max-w-[75%] ${
                        // FIXED: Check against sender's ID
                        m.sender._id === user?.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <strong className="block text-xs font-semibold">
                          {/* FIXED: Use sender's username */}
                          {m.sender._id === user?.id ? "You" : m.sender.username}
                      </strong>
                      {/* FIXED: Use 'content' */}
                      <span>{m.content}</span> 
                    </div>
                    {/* Show current user's avatar on the right */}
                    {/* FIXED: Check against sender's ID */}
                    {m.sender._id === user?.id && ( 
                      <img
                        src={user.photoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
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
                // FIXED: Use 'username'
                placeholder={`Type your message to ${selectedUser.username}...`}
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
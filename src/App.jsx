import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading , setLoading] = useState(false);

  useEffect(() => {
      const token = localStorage.getItem("token");
      if(token){
        const fetchUser = async () => {
          setLoading(true);
          try{
            const res = await axios.get("http://localhost:5000/api/user/profile" , {
              headers : { Authorization : `Bearer ${token}` }
            });
            const data = await res.json();
            setUser(data.user);
          }
          catch(err){
            console.error("Failed to fetch user profile:", err);
            setUser(null);
            localStorage.removeItem("token");
          }
          finally{
            setLoading(false);
          }
        }
        fetchUser();
      }
  }
  , []);
  
  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
      



  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />
      <div className="p-6">
        <Routes>
          <Route path="/" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  );
}
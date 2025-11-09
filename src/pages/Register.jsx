import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState(""); // <-- ADD USERNAME STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
try{
    const res = await axios.post("http://localhost:5000/api/register", {
        username, // <-- SEND USERNAME IN THE REQUEST BODY
        email,
        password,
      });
      alert("Registered! You can now login.");
      navigate("/login");      
      console.log(res.data)

}  catch(err){
      console.error(err);
      alert("Registration failed. Please try again.");
      return;
    }
    
  };

  return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
      {/* ADD USERNAME INPUT FIELD */}
      <input
        type="text"
        placeholder="Username"
        className="w-full border p-2 mb-3 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-3 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-3 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className="w-full bg-green-600 text-white py-2 rounded">Register</button>
    </form>
  );
}
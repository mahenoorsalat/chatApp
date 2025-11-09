import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/login", { email, password });
    console.log(res.data);

    // If login is successful, save token or user data
    setUser(res.data.user);
    localStorage.setItem("token", res.data.token);

    navigate("/");
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Login failed. Please check your credentials and try again.");
  }
};


  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
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
      <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
    </form>
  );
}

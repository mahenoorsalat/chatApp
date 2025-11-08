import { Link } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  return (
    <nav className="flex justify-between bg-blue-600 text-white p-4">
      <h1 className="font-bold text-xl">💬 ChatApp</h1>
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/">Chat</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={() => setUser(null)} className="bg-red-500 px-3 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

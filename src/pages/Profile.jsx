import { useState } from "react";
import axios from "axios";

export default function Profile({ user, setUser }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photo, setPhoto] = useState(user?.photo || "");

  const handleSave = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post("http://localhost:5000/api/user/profile", { name, bio, photo } , {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(res.data);

      setUser({ ...user, name, bio, photo });
          alert("✅ Profile updated successfully!");

    }catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to update profile. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="max-w-sm mx-auto mt-10 bg-white border shadow-md rounded-2xl p-6"
    >
      <h2 className="text-2xl font-semibold text-center mb-6">Update Profile</h2>

      <div className="flex flex-col items-center mb-5">
        <img
          src={
            photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border mb-3"
        />
        <input
          type="url"
          placeholder="Profile photo URL"
          className="w-full border p-2 rounded-md text-sm"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
        />
      </div>

      <input
        type="text"
        placeholder="Name"
        className="w-full border p-2 mb-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Bio"
        className="w-full border p-2 mb-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
        rows="3"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all"
      >
        Save Changes
      </button>
    </form>
  );
}

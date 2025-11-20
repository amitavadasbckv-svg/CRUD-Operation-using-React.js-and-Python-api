import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from "react";

function App() {
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

useEffect(() => {
    fetch("http://127.0.0.1:5000/api/users") // Flask endpoint
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        console.log(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Debug:", Name, Email); // 👈 Check if these print your values
    if (!Name || !Email) {
      setMessage("Name and email are required");
      return;
    }

    // ✅ Email validator (Regex)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(Email)) {
      setMessage("Invalid email format");
      return;
    }

    const userData = {
          "name": Name,
          "email": Email
    }

    try {
      let response;
      if (editingUser !== null) {
        console.log(editingUser)
        // 🟡 UPDATE existing user
        response = await fetch(
          `http://127.0.0.1:5000/api/users/${editingUser.Id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );
      } else {
        // 🟢 ADD new user
        response = await fetch("http://127.0.0.1:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
      }

      const data = await response.json();
      setMessage(data.message || data.error);

      

      // Reset form
      setName("");
      setEmail("");
      setEditingUser(null);
    } catch (err) {
      console.error("Error:", err);
      setMessage("Failed to save user");
    }
  };
// Handle Edit click
  const handleEditClick = (user) => {
    setEditingUser(user);
    setName(user.Name);
    setEmail(user.Email);
  };
  return (
  <div style={{ padding: "20px" }}>
    <h2>User List</h2>

    {users.length === 0 ? (
      <p>No users found.</p>
    ) : (
      <div className="grid-container">

        <div className="grid-header">Name</div>
        <div className="grid-header">Email</div>
        <div className="grid-header">Actions</div>
        {users.map((user) => (
          <React.Fragment key={user.ID}>
      <div className="grid-item">{user.Name}</div>
      <div className="grid-item">{user.Email}</div>
      <div className="grid-item">
        <button
          type="button"
          onClick={() => handleEditClick(user)}
        >
          Edit
        </button>
      </div>
    </React.Fragment>
        ))}
      
      </div>
      
    )}

    <h1>{editingUser ? "Edit User" : "Add User"}</h1>

    {/* FORM ONLY FOR INPUTS */}
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={Name}
        onChange={(e) => {
  console.log("Typed Name =", e.target.value);
  setName(e.target.value);
}}
      />
      <br/><br/>

      <input
        type="email"
        placeholder="Email"
        value={Email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br/><br/>

      <button type="submit">
        {editingUser ? "Update User" : "Add User"}
      </button>
    </form>

    <p>{message}</p>
  </div>
);
}

export default App;




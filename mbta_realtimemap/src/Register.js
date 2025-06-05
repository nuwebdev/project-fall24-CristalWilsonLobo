import React, { useState } from "react";

function Register({ onRegistered }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if(!username || !password) {
      alert("Please enter a username and password");
      return;
    }

    const res = await fetch('http://localhost:5001/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if(data.success) {
      alert("Registration successful! You can now login.");
      onRegistered();
    } else {
      alert(data.error || "Registration failed");
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label htmlFor="register-username">Username:</label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">Password:</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button className="login-button" type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;

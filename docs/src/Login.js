import React, { useState } from "react";
import Register from './Register';
import './Login.css';

function Login({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!username || !password) {
      alert("Username and password are required");
      return;
    }

    const res = await fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if(data.success) {
      onLogin(true);
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      {showRegister ? (
        <Register onRegistered={() => setShowRegister(false)} />
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-username">Username:</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-password">Password:</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button className="login-button" type="submit">Login</button>
          </form>
          <p>Don't have an account? <button className="link-button" onClick={() => setShowRegister(true)}>Register</button></p>
        </>
      )}
    </div>
  );
}

export default Login;

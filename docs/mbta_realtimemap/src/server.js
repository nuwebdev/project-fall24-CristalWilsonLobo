const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite DB
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to the SQLite database.');
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Register endpoint
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) {
    return res.status(400).json({error: "Username and password required"});
  }

  const insert = `INSERT INTO users (username, password) VALUES (?,?)`;
  db.run(insert, [username, password], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({error: "Username already exists"});
      }
      return res.status(500).json({error: "Database error"});
    }
    return res.json({success: true});
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) {
    return res.status(400).json({error: "Username and password required"});
  }

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.get(query, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({error: "Database error"});
    }
    if (row) {
      // User found and password matched
      return res.json({success: true});
    } else {
      return res.status(401).json({error: "Invalid credentials"});
    }
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

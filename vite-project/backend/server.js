import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process'; // Add this line

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./game.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1 TEXT,
    player2 TEXT,
    winner TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

// Define endpoints
app.get('/results', (req, res) => {
    db.all('SELECT * FROM games ORDER BY created_at DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    });
});

app.get('/leaderboard', (req, res) => {
    db.all('SELECT username, wins FROM users ORDER BY wins DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.get('/player-stats/:username', (req, res) => {
    const { username } = req.params;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
        }
    });
});

// Add a route to serve a simple HTML page for the root URL
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Tongits Game API</title>
    </head>
    <body>
        <h1>Welcome to the Tongits Game API</h1>
    </body>
    </html>
  `);
});

// Add a route to serve the front end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../vite-project/dist/index.html'));
});

// Add a fallback route to handle all other requests
app.use((req, res) => {
  res.status(404).send("Sorry, that resource doesn't exist.");
});

// WebSocket Multiplayer Matchmaking
const waitingPlayers = [];

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Matchmaking
  socket.on('findMatch', (username) => {
    console.log(`Player ${username} is looking for a match`);
    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.pop();
      const room = `match_${socket.id}_${opponent.id}`;
      socket.join(room);
      opponent.socket.join(room);

      io.to(room).emit('matchFound', { player1: username, player2: opponent.username, room });
      console.log(`Match found: ${username} vs ${opponent.username}`);
    } else {
      waitingPlayers.push({ id: socket.id, username, socket });
      console.log(`Player ${username} added to waiting list`);
    }
  });

  // Handle Game Moves
  socket.on('gameMove', (data) => {
    console.log(`Game move: ${JSON.stringify(data)}`);
    io.to(data.room).emit('updateGame', data);
  });

  // Store Game Results and Update Stats
  socket.on('gameOver', (data) => {
    const { player1, player2, winner } = data;

    // Save game result
    db.run('INSERT INTO games (player1, player2, winner) VALUES (?, ?, ?)', [player1, player2, winner]);

    // Update player stats
    db.run('UPDATE users SET wins = wins + 1 WHERE username = ?', [winner]);
    const loser = winner === player1 ? player2 : player1;
    db.run('UPDATE users SET losses = losses + 1 WHERE username = ?', [loser]);

    console.log(`Game over: ${winner} won against ${loser}`);
    io.emit('gameHistoryUpdated', data);
  });

  // Disconnect Handling
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
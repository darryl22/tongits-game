const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

const port = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database('./game.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
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

// Game logic moved from frontend
function determineWinner() {
    const randomValue = Math.random(); // 0 to 1
    return randomValue < 0.8 ? 'house' : 'player'; // 80% house win, 20% player win
}

// API to start a game
app.get('/play', (req, res) => {
    let cards = [
        '2C', '2D', '2H', '2S', 
        '3C', '3D', '3H', '3S', 
        '4C', '4D', '4H', '4S', 
        '5C', '5D', '5H', '5S', 
        '6C', '6D', '6H', '6S', 
        '7C', '7D', '7H', '7S', 
        '8C', '8D', '8H', '8S', 
        '9C', '9D', '9H', '9S', 
        '10C', '10D', '10H', '10S',
        'JC', 'JD', 'JH', 'JS',
        'QC', 'QD', 'QH', 'QS',
        'KC', 'KD', 'KH', 'KS',
        'AC', 'AD', 'AH', 'AS',
        'Joker1', 'Joker2'
    ]
    let player1Cards = []

    function generateCards(count) {
        for (let x = 0; x < count; x++) {
            let index = Math.floor(Math.random() * cards.length)
            player1Cards.push(cards[index])
            cards.splice(index, 1)
        }
    }
    generateCards(12)
    console.log(cards)
    res.json({cards: player1Cards})
})

app.post('/play', (req, res) => {
    const { player } = req.body;
    const result = determineWinner();

    db.run('INSERT INTO game_results (player, result) VALUES (?, ?)', [player, result], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Game played', result });
        }
    });
});

app.post("/newuser", (req, res) => {
    console.log(req.body)
    db.run('INSERT into users (username, wins, losses) VALUES (?, ?, ?)', ["newplayer3", 0, 0], function (err) {
        if (err) {
            return res.status(500).json({error: err.message})
            console.log(err)
        }
        res.json({success: "new user added"})
    })
})

// API to fetch game results
app.get('/results', (req, res) => {
    console.log("get results")
    db.all('SELECT * FROM game_results ORDER BY timestamp DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
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

// Add a route to serve the front end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on("connection", (socket) => {
    console.log("player has connected", socket.id)
    console.log(socket.rooms)

    socket.on("playerMove", (move, player) => {
        console.log(`${move} made by player ${player}`)
    })
})

setInterval(() => {
    io.sockets.emit('gameState', {player1: "10", player2: "11", player3: "12"})
}, 1000)

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

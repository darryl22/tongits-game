const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5173; // Changed port to 5173
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Load card images from the public folder
function generateDeck() {
    const imageDir = path.join(__dirname, "../../public/images");
    return fs.readdirSync(imageDir).map(file => ({ name: file, path: `/images/${file}` }));
}

let gameState = {
    deck: [],
    players: [],
    currentTurn: 0
};

function initializeGame() {
    gameState.deck = generateDeck();
    gameState.players = [
        { id: "player1", cards: drawCards(5) },
        { id: "player2", cards: drawCards(5) }
    ];
    gameState.currentTurn = 0;
}

function drawCards(count) {
    if (gameState.deck.length < count) return [];
    return gameState.deck.splice(0, count);
}

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("getGameState", () => {
        socket.emit("updateGameState", gameState);
    });

    socket.on("findMatch", (username) => {
        console.log(`${username} is looking for a match.`);
        initializeGame();
        io.emit("updateGameState", gameState);
    });

    socket.on("drawCard", () => {
        const player = gameState.players[gameState.currentTurn];
        const newCard = drawCards(1);
        if (newCard.length > 0) {
            player.cards.push(newCard[0]);
            gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
            io.emit("updateGameState", gameState);
        }
    });

    socket.on("resetGame", () => {
        initializeGame();
        io.emit("updateGameState", gameState);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

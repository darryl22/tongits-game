const express = require('express');
require('dotenv').config()
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session)
const {MongoClient} = require("mongodb")
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { error } = require('console');
const port = 3002;

const app = express();
const httpServer = createServer(app);

const store = new MongoDBStore ({
    uri: "mongodb://localhost:27017/skateapp",
    databaseName: "tongits",
    collection: "mySessions"
})

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 60 * 60 * 1000 * 5
    },
    store: store,
    resave: true,
    saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public')));

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    },
});

// io.engine.use(session({
//     secret: process.env.SESSION_SECRET,
//     cookie: {
//         maxAge: 60 * 60 * 1000
//     },
//     store: store,
//     resave: true,
//     saveUninitialized: true
// }))

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function createPlayer(player) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("users")
        let res = await collection.insertOne(player)
        // console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

async function findPlayer(player) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("users")
        let res = await collection.findOne(player)
        // console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

async function updatePlayer(filter, update) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("users")
        let res = await collection.updateOne(filter, update)
        // console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

async function createGame(gameID) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("games")
        let res = await collection.insertOne({
            gameid: gameID,
            players: [],
            winner: "none",
            dealer: "",
            turn: "",
            turnIndex: 0,
            deck: [
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
                'AC', 'AD', 'AH', 'AS'
            ],
            discardPile: [],
            active: true
        })
        console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

async function findGame(gameID) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("games")
        let res = await collection.findOne({gameid: gameID})
        // console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

async function updateGame(filter, update) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("games")
        let res = await collection.updateOne(filter, update)
        console.log(res)
        // console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

async function getGamesList(filter) {
    try{
        const db = client.db("tongits")
        const collection = db.collection("games")
        let res = await collection.find(filter).toArray()
        // console.log(res)
        return res
    } catch(err) {
        console.log(err)
    }
}

// Add a route to serve the front end
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

app.get("/home", async (req,res) => {
    let games = await getGamesList({})
    res.json({user: `${req.session.player}`, gamesList: games, leaderboard: []})
})

app.get("/userdetails", async (req,res) => {
    let state = await findGame(req.session.activegame)
    res.json({player: `${req.session.player}`, activegame: state})
})

app.get("/creategame", async (req, res) => {
    let gameID = `game${makeid(5)}`
    await createGame(gameID)
    res.json({gameID: gameID})
})

app.post("/getstate", async (req,res) => {
    console.log(req.query)
    let gameID = req.query.gameID
    let game = await findGame(gameID)
    console.log(game)
    res.json({game: game})
})

function determineWinner() {
    const randomValue = Math.random(); // 0 to 1
    return randomValue < 0.8 ? 'house' : 'player'; // 80% house win, 20% player win
}

function calculateScore(cardScore) {
    let total = 0
    for (let x = 0; x < cardScore.length; x++) {
        if (cardScore[x][0] === "A") {
            total = total + 1
        } else if (cardScore[x][0] === "K" || cardScore[x][0] === "Q" || cardScore[x][0] === "J") {
            total = total + 10
        } else if (cardScore[x][0] === "1") {
            total = total + 10
        } else if (!isNaN(cardScore[x][0])) {
            total = total + parseInt(cardScore[x][0])
        }
    }
    return total
}

function sortCards(cardArray) {
    let oldCards = cardArray
    // set is three or more same rank
    let sets = []
    // run is four or more same suit
    let runs = []
    // let setOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '1', 'K', 'Q', 'J']
    let setOrder = "A234567891KQJ"
    let runOrder = 'CDHS'
    let sortedSets = []
    let sortedRuns = []
    for (let x = 0; x < setOrder.length; x++) {
        let tempSet = []
        for (let y = 0; y < oldCards.length; y++) {
            if (oldCards[y][0] === setOrder[x]) {
                tempSet.push(oldCards[y])
            }
        }
        if (tempSet.length > 0) {
            sortedSets.push(tempSet)
        }
    }
    let sortedArray1 = []
    for (let x = 0; x < sortedSets.length; x++) {
        if (sortedSets[x].length === 3 || sortedSets[x].length === 4) {
            sets.push({
                opened: false,
                rank: sortedSets[x][0][0],
                set: sortedSets[x]
            })
        } else{
            sortedArray1.push(...sortedSets[x])
        }
    }
    let sortedArray2 = []

    for (let x = 0; x < runOrder.length; x++) {
        let tempSet = []
        for (let y = 0; y < sortedArray1.length; y++) {
            if(sortedArray1[y][sortedArray1[y].length - 1] === runOrder[x]) {
                tempSet.push(sortedArray1[y])
            }
        }
        // console.log(tempSet)
        if(tempSet.length > 0) {
            sortedRuns.push(tempSet)
        }
    }

    for (let x = 0; x < sortedRuns.length; x++) {
        if (sortedRuns[x].length > 2) {
            runs.push({
                opened: false,
                suit: sortedRuns[x][0][sortedRuns[x][0].length - 1],
                set: sortedRuns[x]
            })
        } else {
            sortedArray2.push(...sortedRuns[x])
        }
    }

    return {
        sets: sets,
        runs: runs,
        unsorted: sortedArray2
    }

}

async function setTurn(gameid) {
    let gameState = await findGame(gameid)
    if (gameState.turnIndex === gameState.players.length - 1) {
        gameState.turn = gameState.players[0].player
        gameState.turnIndex = 0
    } else {
        gameState.turn = gameState.players[gameState.turnIndex + 1].player
        gameState.turnIndex = gameState.turnIndex + 1
    }

    await updateGame({gameid: gameid}, {$set: {turn: gameState.turn, turnIndex: gameState.turnIndex}})
}

io.on("connection", (socket) => {
    if (socket.recovered) {
        console.log("socket recovered", socket.id)
    }
    console.log(socket.rooms)
    
    socket.on("join game", async (gameID) => {
        console.log("joined game", gameID)
        socket.join(gameID)

        let game = await findGame(gameID)
        let deck = game.deck
        let playerCards = []
        let count = 12
        console.log(deck)
        let newPlayerId = `player${makeid(4)}`
        for (let x = 0; x < count; x++) {
            let index = Math.floor(Math.random() * deck.length)
            playerCards.push(game.deck[index])
            deck.splice(index, 1)
        }
        console.log(deck)
        let newPlayer = {
            player: newPlayerId,
            score: 0,
            betAmount: 0,
            winAmount: 0,
            globalMultiplier: 1,
            balance: 0,
            cards: playerCards,
            sortedCards: sortCards(playerCards),
            connectionID: socket.id
        }
        if (game.players.length < 3) {
            game.players.push(newPlayer)
            if (game.players.length === 1) {
                await updateGame({gameid: gameID}, {$set: {players: game.players, deck: deck, turn: newPlayer.player, dealer: newPlayer.player}})
            } else {
                await updateGame({gameid: gameID}, {$set: {players: game.players, deck: deck}})
            }
            io.to(gameID).emit("new player", game, newPlayerId)
            io.emit("update state")
        }
    })
    
    socket.on("disconnect", () => {
        console.log("player disconnected", socket.id)
    })

    socket.on("draw", async (player, deck, id) => {
        let gameState = await findGame(id)
        for (let x = 0; x < gameState.players.length; x++) {
            if (gameState.players[x].player === player.player) {
                if(deck === "stock" && gameState.deck.length !== 0) {
                    console.log(gameState.deck)
                    gameState.players[x].sortedCards.unsorted.push(gameState.deck[gameState.deck.length - 1])
                    gameState.deck.pop()
                    await updateGame({gameid: id}, {$set: {deck: gameState.deck, players: gameState.players}})
                } else if (deck === "discardpile" && gameState.discardPile.length !== 0) {
                    console.log(gameState.discardPile)
                    gameState.players[x].sortedCards.unsorted.push(gameState.discardPile[gameState.discardPile.length - 1])
                    gameState.discardPile.pop()
                    await updateGame({gameid: id}, {$set: {deck: gameState.deck, players: gameState.players, discardPile: gameState.discardPile}})
                }
            }
        }
        await setTurn(id)
        io.emit("update state")
    })

    socket.on("layoff", async (type, player, card, playerFrom, id) => {
        let gameState = await findGame(id)
        console.log("layoff", type)
        for (let x = 0; x < gameState.players.length; x++) {
            if (gameState.players[x].player === player) {
                if(type === "run") {
                    for (let y = 0; y < gameState.players[x].sortedCards.runs.length; y++) {
                        if (gameState.players[x].sortedCards.runs[y].suit === card[card.length - 1]) {
                            gameState.players[x].sortedCards.runs[y].set.push(card)
                        }
                    }
                } else {
                    for (let y = 0; y < gameState.players[x].sortedCards.sets.length; y++) {
                        if (gameState.players[x].sortedCards.sets[y].rank === card[0]) {
                            gameState.players[x].sortedCards.sets[y].set.push(card)
                        }
                    }
                }
            }
        }

        for (let x = 0; x < gameState.players.length; x++) {
            if(gameState.players[x].player === playerFrom.player) {
                for (let y = 0; y < gameState.players[x].sortedCards.unsorted.length; y++) {
                    if(gameState.players[x].sortedCards.unsorted[y] === card) {
                        gameState.players[x].sortedCards.unsorted.splice(y, 1)
                        gameState.players[x].score = calculateScore(gameState.players[x].sortedCards.unsorted)
                    }
                }
            }
        }
        await updateGame({gameid: id}, {$set: {players: gameState.players}})
        await setTurn(id)
        io.emit("update state")
    })

    socket.on("discard", async (pile, player, cards, id) => {
        let gameState = await findGame(id)
        console.log(pile)
        gameState.discardPile = pile
        for (let x = 0; x < gameState.players.length; x++) {
            if (gameState.players[x].player === player) {
                gameState.players[x].sortedCards.unsorted = cards
                gameState.players[x].score = calculateScore(gameState.players[x].sortedCards.unsorted)
                console.log(gameState.discardPile)
            }
        }
        await updateGame({gameid: id}, {$set: {players: gameState.players, discardPile: gameState.discardPile}})
        await setTurn(id)
        io.emit("update state")
    })

    socket.on("game end", async (id) => {
        let gameState = await findGame(id)
        let scores = []
        let winner = {
            winner: gameState.players[0].player,
            score: gameState.players[0].score 
        }
        let lowest = gameState.players[0].score
        for (let x = 0; x < gameState.players.length; x++) {
            scores.push({
                player: gameState.players[x].player,
                score: gameState.players[x].score
            })
            if (gameState.players[x].score < lowest) {
                lowest = gameState.players[x].score
                winner = {
                    winner: gameState.players[x].player,
                    score: gameState.players[x].score 
                }
            }
        }
        console.log(scores)
        console.log(winner)
        gameState.winner = winner.winner

        await updateGame({gameid: id}, {$set: {winner: gameState.winner, active: false}})
        io.emit("update state")

    })
})

// setInterval(() => {
//     io.sockets.emit('gameState', gameState)
// }, 1000)

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

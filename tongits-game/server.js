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
        maxAge: 60 * 60 * 1000
    },
    store: store,
    resave: true,
    saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public')));

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://rnjsk-41-90-172-52.a.free.pinggy.link"],
        credentials: true
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    }
});

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
    console.log("home")
    let games = await getGamesList({})
    console.log(games)
    res.json({user: `${req.session.user}`, leaderboard: []})
})

app.get("/creategame", async (req, res) => {
    let gameID = `game${makeid(5)}`
    req.session.activegame = gameID

    await createGame(gameID)
    res.json({gameID: gameID})
})

// app.post("/login", async (req, res) => {
//     console.log("login")
//     let user = await findPlayer({name: req.body.data.username})  
//     if(user !== null) {
//         if(user.password === req.body.data.password) {
//             req.session.user = user.playerID
//             res.json({data: "login success"})
//         } else {
//             res.json({error: "Password Missmatch"})
//         }
//     } else {
//         res.json({error: "user does not exist"})
//     }
// })

// app.post("/signup", async (req, res) => {
//     let exists = await findPlayer({name: req.body.data.username})  
//     console.log("exists", exists)
//     if (req.body.data.password === req.body.data.confirmpassword && exists === null) {
//         let user = {
//             playerID: `player${makeid(4)}`,
//             name: req.body.data.username,
//             password: req.body.data.password,
//             balance: 0,
//             wins: 0,
//             losses: 0
//         }
//         createPlayer(user)
//         res.json({status: "success"})
//     } else if (exists !== null){
//         res.json({error: "user exists already"})
//     } else {
//         res.json({error: "error occured during signup"})
//     }
// })

// Serve static files

// Game logic moved from frontend
function determineWinner() {
    const randomValue = Math.random(); // 0 to 1
    return randomValue < 0.8 ? 'house' : 'player'; // 80% house win, 20% player win
}

// API to start a game

app.get('/play', (req, res) => {
    let player1Cards = []

    function generateCards(count) {
        for (let x = 0; x < count; x++) {
            let index = Math.floor(Math.random() * gameState.deck.length)
            player1Cards.push(gameState.deck[index])
            gameState.deck.splice(index, 1)
        }
    }
    generateCards(12)
    // console.log(cards)
    res.json({cards: player1Cards, gameState: "test"})
})

let gameState = {
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
    discardPile: []
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

function setTurn() {
    if (gameState.turnIndex === gameState.players.length - 1) {
        gameState.turn = gameState.players[0].player
        gameState.turnIndex = 0
    } else {
        gameState.turn = gameState.players[gameState.turnIndex + 1].player
        gameState.turnIndex = gameState.turnIndex + 1
    }
}

io.engine.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 60 * 60 * 1000
    },
    store: store,
    resave: true,
    saveUninitialized: true
}))

io.on("connection", (socket) => {
    if (socket.recovered) {
        console.log("socket recovered", socket.id)
    }
    userSession = socket.request.session
    console.log("active game", userSession.activegame)
    if (userSession.activegame !== undefined) {
        socket.join(userSession.activegame)
    }

    console.log(socket.rooms)
    let req = socket.request
    if (gameState.players.length < 3) {
        let playerCards = []
        let count = 12
        for (let x = 0; x < count; x++) {
            let index = Math.floor(Math.random() * gameState.deck.length)
            playerCards.push(gameState.deck[index])
            gameState.deck.splice(index, 1)
        }
        let sorted = sortCards(playerCards)
        gameState.players.push({
            player: `player${makeid(4)}`,
            score: calculateScore(sorted.unsorted),
            cards: playerCards,
            sortedCards: sortCards(playerCards),
            connectionID: socket.id
        })
    }
    if (gameState.players.length > 1) {
        let turnIndex = Math.floor(Math.random() * gameState.players.length)
        gameState.turn = gameState.players[turnIndex].player
        gameState.turnIndex = turnIndex
    }

    io.emit("new player anounce", socket.id, gameState)
    console.log("player has connected", socket.id)
    // createGame()
    
    socket.on("disconnect", () => {
        console.log("player disconnected", socket.id)
        for (let x = 0; x < gameState.players.length; x++) {
            if (gameState.players[x].connectionID === socket.id) {
                console.log(gameState.players[x].player, "is free")
                let newDeck = gameState.deck.concat(gameState.players[x].cards)
                gameState.deck = newDeck
                gameState.players.splice(x, 1)

            }
        }
    })

    socket.on("playerMove", (move, player, gs) => {
        console.log(`${move} made by player ${player}`)
    })

    socket.on("draw", (player, deck) => {
        req.session.reload(err => {
            if(err) {
                console.log(err)
            }
            req.session.user = "testuser"
            req.session.save()
        })
        for (let x = 0; x < gameState.players.length; x++) {
            if (gameState.players[x].player === player.player) {
                console.log(player.player)
                if(deck === "stock" && gameState.deck.length !== 0) {
                    console.log(gameState.deck)
                    gameState.players[x].sortedCards.unsorted.push(gameState.deck[gameState.deck.length - 1])
                    gameState.deck.pop()
                } else if (deck === "discardpile" && gameState.discardPile.length !== 0) {
                    console.log(gameState.discardPile)
                    gameState.players[x].sortedCards.unsorted.push(gameState.discardPile[gameState.discardPile.length - 1])
                    gameState.discardPile.pop()
                }
            }
        }
    })

    socket.on("layoff", (type, player, card, playerFrom) => {
        console.log("layoff", type)
        console.log(player)
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
        setTurn()
    })
    socket.on("discard", (pile, player, cards) => {
        gameState.discardPile = pile
        setTurn()
        for (let x = 0; x < gameState.players.length; x++) {
            if (gameState.players[x].player === player) {
                gameState.players[x].sortedCards.unsorted = cards
                gameState.players[x].score = calculateScore(gameState.players[x].sortedCards.unsorted)
                console.log(gameState.discardPile)
            }
        }
    })

    socket.on("game end", () => {
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
    })
})

setInterval(() => {
    io.sockets.emit('gameState', gameState)
}, 1000)

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

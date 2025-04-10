import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from "axios"
import { socket } from '../connections/connection';
import "./game.css"
import placeholderCard from "../assets/cards/placeholder.png"
// import { useCookies } from 'react-cookie';

const swapSound = new Audio("/audio/swapsound.mp3")
const discardSound = new Audio("/audio/discardsound.mp3")
const chimeSound = new Audio("/audio/chime.mp3")
const winner = new Audio("/audio/winner.mp3")

function Game() {
    // let backgroundMusic = new Audio("./public/audio/background.mp3")
    // const [cookies, setCookie, removeCookie] = useCookies(["player"])
    const [player, setPlayer] = useState({
        player: "",
        score: 0,
        cards: [],
        sortedCards: {
            sets: [],
            runs: [],
            unsorted: []
        },
        connectionID: ""
    })
    const [gameState, setGameState] = useState({
        gameid: "",
        players: [],
        winner: "none",
        dealer: "",
        turn: "",
        turnIndex: 0,
        deck: [],
        discardPile: [],
        active: true
    })

    const [selectedCard, setSelectedCard] = useState([])
    function calculateScore(cardScore) {
        let total = 0
        for (let x = 0; x < cardScore.length; x++) {
            console.log(cardScore[x][0])
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
        console.log(total)
        return total
    }

    function sortCards() {
        let oldCards = [...player.cards]
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
        console.log(sets, "sets")
        console.log(runs, "runs")
        console.log(sortedArray2, "left")

    }
    let playerSession = sessionStorage.getItem("player")
    let gameSession = sessionStorage.getItem("gameID")
    useEffect(() => {
        socket.on("connect", () => {
            console.log("new player id", socket.id)
        })

        socket.on("new player", (game, id) => {
            console.log("new player joined", game, id)
            sessionStorage.setItem("player", id)
            sessionStorage.setItem("gameID", game.gameid)
            for(let x = 0; x < game.players.length; x++) {
                if(game.players[x].player === id) {
                    setPlayer(game.players[x])
                }
            }
            setGameState(game)
        })

        console.log(playerSession)
        console.log(gameSession)
        socket.on("update state", () => {
            console.log("update state")
            // axios.post(`http://localhost:3002/getstate?gameID=${gameSession}`, {withCredentials: "true"})
            axios.post(`http://185.202.239.81:3002/getstate?gameID=${gameSession}`, {withCredentials: "true"})
            .then(result => {
                console.log(result)
                let game = result.data.game
                for(let x = 0; x < game.players.length; x++) {
                    if(game.players[x].player === playerSession) {
                        setPlayer(game.players[x])
                    }
                }
                setGameState(result.data.game)
            })
            .catch(err => {
            console.log(err)
            })
        })

        console.log("update state")
        // axios.post(`http://localhost:3002/getstate?gameID=${gameSession}`, {withCredentials: "true"})
        axios.post(`http://185.202.239.81:3002/getstate?gameID=${gameSession}`, {withCredentials: "true"})
        .then(result => {
            console.log(result)
            let game = result.data.game
            for(let x = 0; x < game.players.length; x++) {
                if(game.players[x].player === playerSession) {
                    setPlayer(game.players[x])
                }
            }
            setGameState(result.data.game)
        })
        .catch(err => {
        console.log(err)
        })

        // socket.on("gameState", (state) => {
        //     for (let x = 0; x < state.players.length; x++) {
        //         if(state.players[x].connectionID === socket.id) {
        //             setPlayer(state.players[x])
        //         }
        //     }
        //     setGameState(state)
        // })


        // return () => {
        //     socket.off("connect")
        //     socket.off("new player anounce")
        //     socket.off("gameState")
        // }
    }, [])
    // console.log(player)

    let playersList = gameState.players.map((item, index) => {
        if (gameState.players[index].player !== player.player) {
            return <div className="player-div" key={index}>
                <p style={{fontWeight: "bold"}}>{item.player}</p>
                <div>
                    <div className="your-cards">
                        <div className='cards-set-section'>
                            {gameState.players[index].sortedCards.sets.map((playerSets, setIndex) => {
                                return <div className='your-cards-subsets' key={setIndex} onClick={() => layoff(playerSets, "set", item.player)}>
                                        {playerSets.set.map((val2, index2) => {
                                            const cardUrl = new URL(`../assets/cards2/${val2}.svg`, import.meta.url).href
                                            return <div key={index2} className='card-image-div' style={{marginLeft: "-3em"}}>
                                                    <img src={cardUrl} alt={val2} className='card-image'/>
                                                </div>})
                                        }
                                    </div>
                            })}
                            {gameState.players[index].sortedCards.runs.map((playerSets, setIndex) => {
                                return <div className='your-cards-subsets' key={setIndex} onClick={() => layoff(playerSets, "run", item.player)}>
                                        {playerSets.set.map((val2, index2) => {
                                            const cardUrl = new URL(`../assets/cards2/${val2}.svg`, import.meta.url).href
                                            return <div key={index2} className='card-image-div' style={{marginLeft: "-3em"}}>
                                                    <img src={cardUrl} alt={val2} className='card-image'/>
                                                </div>})
                                        }
                                    </div>
                            })}
                        </div>
                        <div className='cards-set-section'>
                        </div>
                    </div>
                    
                </div>
            </div>
        }
    })

    const cardList = player.sortedCards.unsorted.map((value, index) => {
        const cardUrl = new URL(`../assets/cards2/${value}.svg`, import.meta.url).href
        return <div key={index} onClick={() => handleSelectedCard(value, index)} style={{transform: selectedCard[0] === value? "translateY(-20px)": "none", marginLeft: "-3em"}} className='card-image-div'>
            <img src={cardUrl} alt={value} className='card-image'/>
        </div>
    })

    const setList = player.sortedCards.sets.map((value, index) => {
        return <div className='your-cards-subsets' key={index}>
            {value.set.map((val2, index2) => {
                const cardUrl = new URL(`../assets/cards2/${val2}.svg`, import.meta.url).href
                return <div key={index2} className='card-image-div' style={{marginLeft: "-3em"}}>
                        <img src={cardUrl} alt={val2} className='card-image'/>
                    </div>})
            }
        </div>
    })

    const runList = player.sortedCards.runs.map((value, index) => {
        return <div className='your-cards-subsets' key={index}>
            {value.set.map((val2, index2) => {
                const cardUrl = new URL(`../assets/cards2/${val2}.svg`, import.meta.url).href
                return <div key={index2} className='card-image-div' style={{marginLeft: "-3em"}}>
                    <img src={cardUrl} alt={val2} className='card-image'/>
                </div>})
            }
        </div>
    })

    function handleSelectedCard(card, index) {
        // console.log(card, index)
        setSelectedCard([card, index])
        swapSound.play()
    }

    function draw(deck) {
        if (gameState.turn === player.player) {
            console.log("drawn from", deck)
            if (deck === "discardpile" && gameState.discardPile.length !== 0) {
                socket.emit("draw", player, deck, gameState.gameid)
            } else if(deck !== "discardpile") {
                socket.emit("draw", player, deck, gameState.gameid)
            }
        }

        if (gameState.deck.length === 0) {
            socket.emit("game end", gameState.gameid)
        }
    }

    function fight() {
        if(gameState.turn === player.player) {
            winner.play()
            console.log("fight")
            socket.emit("game end", gameState.gameid)
        }
    }

    function layoff(playerset, type, p) {
        if (gameState.turn === player.player && selectedCard.length !== 0) {
            chimeSound.play()
            console.log(playerset, type, p)
            console.log(selectedCard)
            if (type === "set") {
                if (playerset.rank === selectedCard[0][0]) {
                    socket.emit("layoff", type, p, selectedCard[0], player, gameState.gameid)
                }
            } else {
                if (playerset.suit === selectedCard[0][selectedCard[0].length - 1]) {
                    socket.emit("layoff", type, p, selectedCard[0], player, gameState.gameid)
                }
            }
        }
    }

    function discard() {
        if (gameState.turn === player.player && selectedCard.length !== 0) {
            discardSound.play()
            let newCards = [...player.sortedCards.unsorted]
            console.log(newCards)
            let discardPile = gameState.discardPile
            for (let x = 0; x < newCards.length; x++) {
                if (newCards[x] === selectedCard[0]) {
                    newCards.splice(x, 1)
                    discardPile.push(selectedCard[0])
                    console.log(newCards)
                    // setGameState(prev => {
                    //     return {...prev, discardPile: [...discardPile]}
                    // })
                }
            }
            // setTurn()
            socket.emit("discard", discardPile, player.player, newCards, gameState.gameid)
        }
    }

    
    return(
        <div>
            <div className="game-div">
                <div style={{width: "fit-content", margin: "auto", display: gameState.winner === "none" ? "none" : "block"}}>
                    <p style={{fontSize: "3em"}}>WINNER: {gameState.winner}</p>
                </div>
                <p style={{color: "black", textAlign: "center", fontSize: "1.2em"}}> gameID: {gameState.gameid}</p>
                <div className="center-stack" style={{display: gameState.active ? "flex" : "none"}}>
                    <div className="other-player-cards">
                        {playersList}
                    </div>
                    <div style={{display: "flex", gap: "2em"}}>
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <p style={{fontWeight: "bold"}}>Stock: {gameState.deck.length}</p>
                            <img src={placeholderCard} alt="placeholder" className='card-image' style={{cursor: "pointer"}} onClick={() => draw("stock")}/>
                        </div>
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <p style={{fontWeight: "bold"}}>Discard Pile: {gameState.discardPile.length}</p>
                            <img src={gameState.discardPile.length === 0 ? placeholderCard : new URL(`../assets/cards2/${gameState.discardPile[gameState.discardPile.length - 1]}.svg`, import.meta.url).href} alt="placeholder" className='card-image' style={{cursor: "pointer"}} onClick={() => draw("discardpile")}/>
                        </div>
                    </div>
                    <p style={{fontWeight: "bold"}}>Players: {gameState.players.length}</p>
                    <p style={{fontWeight: "bold"}}>Turn: {gameState.turn}</p>
                </div>
                <div className="your-moves" style={{display: gameState.active ? "flex" : "none"}}>
                    <button onClick={draw}>draw</button>
                    <button onClick={fight}>fight</button>
                    <button onClick={layoff}>layoff</button>
                    <button onClick={discard}>discard</button>
                    {/* <button onClick={sortCards}>sort</button> */}
                </div>
                <div style={{width: "fit-content", margin: "auto", marginBottom: "3em"}}>
                    <button onClick={fight} className='tongit-button' style={{display: player.sortedCards.unsorted.length === 0 ? "block" : "none"}}>Call Tongits</button>
                </div>
                <p style={{textAlign: "center", fontWeight: "bold"}}>{player.player}</p>

                <div className="your-cards" style={{display: gameState.active ? "flex" : "none"}}>
                    <div className='cards-set-section'>
                        {setList}
                    </div>
                    <div className='cards-set-section'>
                        {runList}
                    </div>
                    <div style={{border: "2px solid white", padding: "1em"}}>
                        <div className="your-cards-subsets2">{cardList}</div>
                        <p style={{textAlign: "center"}}>Unsorted Deck</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Game
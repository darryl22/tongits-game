import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from "axios"
import { socket } from '../connections/connection';
import "./game.css"

function Game() {
    console.log(socket)
    const [isConnected, setIsConnected] = useState(socket.connected)
    const [cards, setCards] = useState([])
    function onConnect() {
        setIsConnected(true)
    }

    function onDisconnect() {
        setIsConnected(false)
    }

    function drop() {
        socket.emit("playerMove", "drop", "player1")
    }

    function fight() {
        socket.emit("playerMove", "fight", "player1")
    }

    function ungroup() {
        socket.emit("playerMove", "ungroup", "player1")
    }

    function dump() {
        socket.emit("playerMove", "dump", "player1")
    }
    useEffect(() => {
        console.log("setting cards")
        axios.get("http://localhost:3002/play", {
          result: "test result"
        })
        .then(result => {
            setCards(result.data.cards)
        })
        .catch(err => {
            console.log(err)
        })
    }, [isConnected]);
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    // socket.on("gameState", (state) => {
    //     console.log(state)
    // })
    // console.log(cards)

    const cardList = cards.map((value, index) => {
        const cardUrl = new URL(`../assets/cards/${value}.jpg`, import.meta.url).href
        return <div key={index}>
            <img src={cardUrl} alt={value} className='card-image'/>
        </div>
    })
    
    return(
        <div>
            <h1 style={{textAlign: "center"}}>New Game</h1>
            <div className="game-div">
                <div className="other-player-cards">
                    <div className="player2-div">
                        <p>Player 1</p>
                        <p>Cards: 12</p>
                        <p>Points: 30</p>
                    </div>
                    <div className="player3-div">
                        <p>Player 2</p>
                        <p>Cards: 12</p>
                        <p>Points: 30</p>
                    </div>
                </div>
                <div className="center-stack">
                    <p>Card Count: 13</p>
                </div>
                <div className="your-moves">
                    <button onClick={drop}>drop</button>
                    <button onClick={fight}>fight</button>
                    <button onClick={ungroup}>ungroup</button>
                    <button onClick={dump}>dump</button>
                </div>
                <div className="your-cards">
                    {cardList}
                </div>
            </div>
        </div>
    )
}

export default Game
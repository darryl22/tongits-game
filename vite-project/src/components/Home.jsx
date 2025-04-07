import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import '../App.css';
import { Link } from "react-router-dom";

import axios from "axios"
import { socket } from '../connections/connection';

function Home() {
  const [user, setUser] = useState("")
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [redirectTo, setRedirectTo] = useState([false, ""])
  const [gamesList, setGamesList] = useState()
  const navigate = useNavigate()
  if (redirectTo[0] === true) {
    return <Navigate to={redirectTo[1]}/>
  }

  function joinGame(gameID) {
    console.log(gameID)
    socket.emit("join game", gameID)
    navigate("/game")
  }

  function createGame() {
    axios.get("http://localhost:3002/creategame", {withCredentials: "true"})
    .then(result => {
      console.log(result)
      socket.emit("join game", result.data.gameID)
      navigate("/game")

    })
    .catch(err => {
      console.log(err)
    })
  }
  
  useEffect(() => {
    axios.get("http://localhost:3002/home", {withCredentials: "true"})
    .then(result => {
      console.log(result.data)
      let games = result.data.gamesList.map((item, index) => {
        console.log(item.active)
        return <div className='open-game-item' key={index}>
          <p>gameID: {item.gameid}</p>
          <button onClick={()=> joinGame(item.gameid)}>Join</button>
        </div>
      })
      setGamesList(games)
    })
    .catch(err => {
      console.log(err)
    })
  }, []);

  return (
    <div className='home-main-div'>
        <div>
            <h1>Tongits Game</h1>
        </div>
        <div>
          <button onClick={createGame}>Create game</button>
        </div>
        {/* <Link to="/login">
        <button style={{display: user === "undefined" ? "block" : "none"}}>Login</button>
        </Link> */}
        <div>
            <h2>Game Results</h2>
            <ul>
            </ul>
        </div>
        
        <div className='open-games'>
          <h2>Open Games</h2>
          <div className='open-games-div'>
            {gamesList}
          </div>
        </div>
        {/* {playerStats && (
            <div>
            <h2>Player Stats</h2>
            <p>Username: {playerStats.username}</p>
            <p>Wins: {playerStats.wins}</p>
            <p>Losses: {playerStats.losses}</p>
            </div>
        )} */}
    </div>
  );
}

export default Home;

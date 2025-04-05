import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import '../App.css';
import { Link } from "react-router-dom";

import axios from "axios"
import { socket } from '../connections/connection';

function Home() {
  const [user, setUser] = useState("")
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [redirectTo, setRedirectTo] = useState([false, ""])
  if (redirectTo[0] === true) {
      return <Navigate to={redirectTo[1]}/>
  }

  useEffect(() => {
    axios.get("http://localhost:3002/home", {withCredentials: "true"})
    .then(result => {
      console.log(result)
      setUser(result.data.user)
    })
    .catch(err => {
      console.log(err)
    })
  }, []);

  function createGame() {
    axios.get("http://localhost:3002/creategame", {withCredentials: "true"})
    .then(result => {
      console.log(result)
    })
    .catch(err => {
      console.log(err)
    })
  }

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
        <div>
            <h2>Leaderboard</h2>
            <ul>
            
            </ul>
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

import React, { useState, useEffect } from 'react';
import '../App.css';
import { Link } from "react-router-dom";

import axios from "axios"
import { socket } from '../connections/connection';

function Home() {
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3002/results", {
      result: "test result"
    })
    .then(result => {
      console.log(result)
    })
    .catch(err => {
        console.log(err)
    })

    axios.get("http://localhost:3002/leaderboard")
    .then(result => {
        console.log(result.data)
        setLeaderboard(result.data)
    })
    .catch(err => {
        console.log(err)
    })
    }, []);

  const fetchPlayerStats = (username) => {
    fetch(`http://localhost:3002/player-stats/${username}`)
      .then(response => response.json())
      .then(data => {
        console.log('Player stats:', data);
        setPlayerStats(data);
      });
  };

  return (
    <div className='home-main-div'>
        <div>
            <h1>Tongits Game</h1>
        </div>
        <Link to="/game">
            <button>join game</button>
        </Link>
        <div>
            <h2>Game Results</h2>
            <ul>
            {results.map(result => (
                <li key={result.id}>{result.player}: {result.result}</li>
            ))}
            </ul>
        </div>
        <div>
            <h2>Leaderboard</h2>
            <ul>
            {leaderboard.map(player => (
                <li key={player.username}>{player.username}: {player.wins} wins</li>
            ))}
            </ul>
        </div>
        {playerStats && (
            <div>
            <h2>Player Stats</h2>
            <p>Username: {playerStats.username}</p>
            <p>Wins: {playerStats.wins}</p>
            <p>Losses: {playerStats.losses}</p>
            </div>
        )}
    </div>
  );
}

export default Home;

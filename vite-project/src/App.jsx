import React, { useState, useEffect } from 'react';
import './App.css';
import axios from "axios"
import { socket } from './connections/connection';

function App() {
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
    <>
      <div>
        <h1>Tongits Game</h1>
      </div>
      <button>new user</button>
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
    </>
  );
}

export default App;

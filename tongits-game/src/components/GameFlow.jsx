import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { SERVER_URL, GAME_SETTINGS } from '../config';

// Import images
import gameBackgroundImage from '../assets/graphics/background.jpeg';
import jiliStartImage from '../assets/graphics/graphics/jili_start.jpeg';
import gameTableImage from '../assets/graphics/graphics/gaming_table_with_pie_chart.png';
import winBoardImage from '../assets/graphics/graphics/win_board.png';
import loseBoardImage from '../assets/graphics/graphics/lose.png';

// Card images path
const cardBasePath = '/images/';
const cardNames = ['7H', '7S', '8C', '8D', '8H', '8S', '9C', '9D', 'AC', 'AD', 'AH', 'AS', 'JC', 'JD', 'JH', 'jocker_1'];

const socket = io(SERVER_URL);

const GameFlow = () => {
    const [playerCards, setPlayerCards] = useState([]);
    const [opponentCards, setOpponentCards] = useState(7);
    const [tableCards, setTableCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        startGame();
    }, []);

    const startGame = () => {
        const shuffledCards = shuffleCards(cardNames);
        setPlayerCards(shuffledCards.slice(0, 7));
        setOpponentCards(7);
        setTableCards([]);
        setCurrentPlayer(0);
    };

    const shuffleCards = (cards) => [...cards].sort(() => Math.random() - 0.5);

    const handlePlayerMove = () => {
        if (currentPlayer !== 0 || gameOver) return;
        const newCard = cardNames[Math.floor(Math.random() * cardNames.length)];
        setPlayerCards((prev) => [...prev, newCard]);
        setTableCards((prev) => [...prev, newCard]);
        checkForGameEnd();
        setCurrentPlayer(1);
        setTimeout(opponentTurn, 2000);
    };

    const opponentTurn = () => {
        if (gameOver) return;
        setOpponentCards((prev) => prev - 1);
        setTableCards((prev) => [...prev, "Back"]);
        checkForGameEnd();
        setCurrentPlayer(0);
    };

    const checkForGameEnd = () => {
        if (playerCards.length >= GAME_SETTINGS.maxCards) {
            endGame('player');
        } else if (opponentCards <= 0) {
            endGame('opponent');
        }
    };

    const endGame = (winner) => {
        setWinner(winner);
        setGameOver(true);
        socket.emit('gameOver', { winner });
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#222' }}>
            {/* Background Table */}
            <img src={gameTableImage} alt="Game Table" style={{ width: '100%', height: '100%' }} />

            {/* Table Cards */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: '10px' }}>
                {tableCards.map((card, index) => (
                    <img key={index} src={card === "Back" ? `${cardBasePath}back.png` : `${cardBasePath}${card}.png`} alt={card} style={{ width: '80px', height: '120px' }} />
                ))}
            </div>

            {/* Opponent's Cards */}
            <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                {Array(opponentCards).fill("Back").map((_, index) => (
                    <img key={index} src={`${cardBasePath}back.png`} alt="Card Back" style={{ width: '70px', height: '100px' }} />
                ))}
            </div>

            {/* Player's Cards */}
            <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
                {playerCards.map((card, index) => (
                    <img key={index} src={`${cardBasePath}${card}.png`} alt={card} style={{ width: '80px', height: '120px' }} onClick={handlePlayerMove} />
                ))}
            </div>

            {gameOver && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <img src={winner === 'player' ? winBoardImage : loseBoardImage} alt={winner === 'player' ? 'Win' : 'Lose'} style={{ width: '80%' }} />
                </div>
            )}
        </div>
    );
};

export default GameFlow;

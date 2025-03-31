import React, { useState, useEffect } from 'react';
import './GameBoard.css';
import winSound from '../assets/audio/win.mp3';
import loseSound from '../assets/audio/lose.mp3';
import backgroundMusicFile from '../assets/audio/background.mp3';

import initialBackground from '../assets/graphics/background.jpeg';
import characterScreen from '../assets/graphics/graphics/characters.png';
import gameTableBackground from '../assets/graphics/graphics/game_table.png';


import cardImages from '../assets/graphics/cardImages';

const deck = [
    '7H', '7S', '8C', '8D', '8H', '8S', '9C', '9D', '9H', '9S',
    'AC', 'AD', 'AH', 'AS', 'JC', 'JD', 'JH', 'JOCKER'
];

function GameBoard() {
    const [playerCard, setPlayerCard] = useState('');
    const [dealerCard, setDealerCard] = useState('');
    const [result, setResult] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(initialBackground);
    const [loading, setLoading] = useState(false);
    const [backgroundMusic, setBackgroundMusic] = useState(null);

    useEffect(() => {
        const bgMusic = new Audio(backgroundMusicFile);
        bgMusic.loop = true;
        bgMusic.volume = 0.5;
        setBackgroundMusic(bgMusic);

        bgMusic.play().catch(err => console.warn('Background music failed:', err));

        return () => {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        };
    }, []);

    const playAudio = (isWin) => {
        const audio = new Audio(isWin ? winSound : loseSound);
        audio.play();
    };

    const drawCards = () => {
        // Step 1: Show character screen
        setBackgroundImage(characterScreen);
        setLoading(true);

        setTimeout(() => {
            // Step 2: After 5 seconds, draw cards and show game table
            const playerCard = deck[Math.floor(Math.random() * deck.length)];
            const dealerCard = deck[Math.floor(Math.random() * deck.length)];

            setPlayerCard(playerCard);
            setDealerCard(dealerCard);

            // 80/20 rule - 20% win chance
            const isPlayerWin = Math.random() < 0.2;

            if (isPlayerWin) {
                setResult('You Win!');
                playAudio(true);
            } else {
                setResult('You Lose!');
                playAudio(false);
            }

            setBackgroundImage(gameTableBackground);
            setLoading(false);
        }, 5000); // 5 seconds delay
    };

    const getCardImage = (card) => {
        return cardImages[card] || cardImages['JOCKER'];  // Fallback to 'JOCKER' if a card image is missing
    };

    return (
        <div className="game-board" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <h1>Tongits Game</h1>

            {!loading && (
                <>
                    <div className="cards">
                        <div className="card">
                            <h3>Player's Card</h3>
                            {playerCard && <img src={getCardImage(playerCard)} alt={playerCard} />}
                        </div>
                        <div className="card">
                            <h3>Dealer's Card</h3>
                            {dealerCard && <img src={getCardImage(dealerCard)} alt={dealerCard} />}
                        </div>
                    </div>
                    <button onClick={drawCards}>Draw Cards</button>
                    <h2>{result}</h2>
                </>
            )}
        </div>
    );
}

export default GameBoard;

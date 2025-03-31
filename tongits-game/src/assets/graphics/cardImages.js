const cardImages = {};

const cardList = [
    '7H', '7S', '8C', '8D', '8H', '8S', '9C', '9D', '9H', '9S',
    'AC', 'AD', 'AH', 'AS', 'JC', 'JD', 'JH', 'JOCKER'
];

// Dynamically import each card, with error fallback
cardList.forEach(card => {
    try {
        cardImages[card] = require(`./cards/${card}.png`);
    } catch (error) {
        console.warn(`Missing image for ${card}, using placeholder.`);
        cardImages[card] = require('../../../public/images/cards/placeholder.png'); // Create placeholder.png if needed
    }
});

export default cardImages;

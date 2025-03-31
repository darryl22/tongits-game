export function determineWinner() {
    const randomValue = Math.random(); // 0 to 1
    if (randomValue < 0.8) {
        return 'house';  // 80% house win
    } else {
        return 'player'; // 20% player win
    }
}

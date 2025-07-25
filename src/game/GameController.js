const AsciiTable = require('ascii-table');
class GameController {
    constructor(dice) {
        this.dice = dice;
        this.playerDiceIndex = -1;
        this.computerDiceIndex = -1;
        this.lastAvailableDiceIndexes = [];
    }
    displayAvailableDice(availableDiceIndexes) {
        this.lastAvailableDiceIndexes = availableDiceIndexes;
        availableDiceIndexes.forEach((originalIndex, displayIndex) => {
            if (this.dice[originalIndex]) {
                console.log(`${displayIndex} - ${this.dice[originalIndex].faces.join(',')}`);
            }
        });
    }
    getOriginalDiceIndexFromDisplayIndex(displayIndex) {
        if (displayIndex >= 0 && displayIndex < this.lastAvailableDiceIndexes.length) {
            return this.lastAvailableDiceIndexes[displayIndex];
        }
        return null;
    }
    setDiceChoices(playerDiceOriginalIndex, computerDiceOriginalIndex) {
        this.playerDiceIndex = playerDiceOriginalIndex;
        this.computerDiceIndex = computerDiceOriginalIndex;
    }
    playRound(computerRollFaceIndex, playerRollFaceIndex) {
        const playerDice = this.dice[this.playerDiceIndex];
        const computerDice = this.dice[this.computerDiceIndex];
        const playerResult = playerDice.faces[playerRollFaceIndex];
        const computerResult = computerDice.faces[computerRollFaceIndex];
        let result;
        if (playerResult > computerResult) {
            result = 'Player wins!';
        } else if (computerResult > playerResult) {
            result = 'Computer wins!';
        } else {
            result = 'Tie!';
        }
        console.log(`Your dice ${this.playerDiceIndex + 1} (${playerDice.faces.join(',')}) rolled face: ${playerResult}`);
        console.log(`My dice ${this.computerDiceIndex + 1} (${computerDice.faces.join(',')}) rolled face: ${computerResult}`);
        console.log(`Result: ${result}`);
    }
    getAvailableDiceIndexes(excludeIndexes = []) {
        const allIndexes = Array.from({ length: this.dice.length }, (_, i) => i);
        return allIndexes.filter(index => !excludeIndexes.includes(index));
    }
    #calculateWinProbability(diceA, diceB) {
        let wins = 0;
        let losses = 0;
        let ties = 0;
        for (const faceA of diceA.faces) {
            for (const faceB of diceB.faces) {
                if (faceA > faceB) {
                    wins++;
                } else if (faceA < faceB) {
                    losses++;
                } else {
                    ties++;
                }
            }
        }
        const totalOutcomes = diceA.faces.length * diceB.faces.length;
        if (totalOutcomes === 0) return 'N/A';
        return (wins / totalOutcomes).toFixed(4);
    }
    getWinningDiceIndex(opponentDiceOriginalIndex, availableDiceOriginalIndexes) {
        const opponentDice = this.dice[opponentDiceOriginalIndex];
        let bestWinningDiceIndex = null;
        let maxWinProbability = -1;
        for (const currentDiceOriginalIndex of availableDiceOriginalIndexes) {
            const currentDice = this.dice[currentDiceOriginalIndex];
            if (currentDice) {
                const winProb = parseFloat(this.#calculateWinProbability(currentDice, opponentDice));
                if (winProb > 0.5 && winProb > maxWinProbability) {
                    maxWinProbability = winProb;
                    bestWinningDiceIndex = currentDiceOriginalIndex;
                }
            }
        }
        return bestWinningDiceIndex;
    }
    getOptimalStartingDiceIndex() {
        const numDice = this.dice.length;
        let optimalDiceIndexes = [];
        let maxWinsAgainstOthers = -1;
        const winCounts = new Array(numDice).fill(0);
        for (let i = 0; i < numDice; i++) {
            for (let j = 0; j < numDice; j++) {
                if (i !== j) {
                    const winProb = parseFloat(this.#calculateWinProbability(this.dice[i], this.dice[j]));
                    if (winProb > 0.5) {
                        winCounts[i]++;
                    }
                }
            }
        }
        for (let i = 0; i < numDice; i++) {
            if (winCounts[i] > maxWinsAgainstOthers) {
                maxWinsAgainstOthers = winCounts[i];
                optimalDiceIndexes = [i];
            } else if (winCounts[i] === maxWinsAgainstOthers) {
                optimalDiceIndexes.push(i);
            }
        }
        if (optimalDiceIndexes.length === 0 || maxWinsAgainstOthers === 0) {
            const randomIndex = Math.floor(Math.random() * numDice);
            return randomIndex;
        }
        const randomIndexInOptimalList = Math.floor(Math.random() * optimalDiceIndexes.length);
        return optimalDiceIndexes[randomIndexInOptimalList];
    }
    displayProbabilityTable() {
        console.log('\nProbability of the win for the user:');
        const numDice = this.dice.length;
        const table = new AsciiTable('');
        const headerRow = ['User dice v'];
        this.dice.forEach((dice, index) => {
            headerRow.push(`D${index + 1} (${dice.faces.join(',')})`);
        });
        table.setHeading(...headerRow);
        for (let i = 0; i < numDice; i++) {
            const row = [`D${i + 1} (${this.dice[i].faces.join(',')})`];
            for (let j = 0; j < numDice; j++) {
                if (i === j) {
                    row.push('N/A');
                } else {
                    row.push(this.#calculateWinProbability(this.dice[i], this.dice[j]));
                }
            }
            table.addRow(...row);
        }
        console.log(table.toString());
    }
}
module.exports = GameController;
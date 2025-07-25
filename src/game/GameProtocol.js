const readline = require('readline');
const FairNumberGenerator = require('../utils/FairNumberGenerator');

class GameProtocol {
    static #readLineAsync(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }))
    }
    static #displayGeneralOptions() {
        console.log(`X - exit`);
        console.log(`? - help`);
    }
    static async askInputWithValidation(promptMessage, validNumericValues, gameControllerInstance, displaySpecificOptionsFn) {
        let isValidInput = false;
        let userInput;
        while (!isValidInput) {
            if (displaySpecificOptionsFn) {
                displaySpecificOptionsFn(validNumericValues);
            }
            GameProtocol.#displayGeneralOptions();
            userInput = (await GameProtocol.#readLineAsync(promptMessage)).trim().toLowerCase();
            if (userInput === 'x') {
                console.log('Exiting game...');
                process.exit(0);
            } else if (userInput === '?') {
                if (gameControllerInstance) {
                    gameControllerInstance.displayProbabilityTable();
                } else {
                    console.log("Error: Game Controller instance not available to display probability table.");
                }
                continue;
            }
            const numInput = parseInt(userInput);
            if (!isNaN(numInput) && validNumericValues.includes(numInput)) {
                isValidInput = true;
            } else {
                console.log(`Error ! Invalid input. Please enter a valid option.`);
            }
        }
        return parseInt(userInput);
    }
    static async #performCommitRevealProtocol(min,max,commitMessage,revealMessage,inputPromptMessage,gameControllerInstance){
        const range = max - min + 1;
        const systemRandomNumberX = FairNumberGenerator.generateSecureRandomNumber(min, max);
        const systemSecretKey = FairNumberGenerator.generateSecretKey();
        const systemHmac = FairNumberGenerator.calculateHmacSha3(systemRandomNumberX, systemSecretKey);

        console.log(commitMessage.replace('{min}', min).replace('{max}', max).replace('{hmac}', systemHmac));

        const validValues = Array.from({ length: range }, (_, i) => min + i);
        const displayNumericOptions = (vals) => {
            vals.forEach(val => console.log(`${val} - ${val}`));
        };
        const playerSelectedNumberY = await GameProtocol.askInputWithValidation(
            inputPromptMessage,
            validValues,
            gameControllerInstance,
            displayNumericOptions
        );

        console.log(revealMessage.replace(/{x}/g, systemRandomNumberX).replace(/{key}/g, systemSecretKey).replace(/{hmac}/g, systemHmac));

        const finalResult = (systemRandomNumberX + playerSelectedNumberY) % range;
        return {
            finalResult: finalResult,
            systemRandomNumberX: systemRandomNumberX,
            systemSecretKey: systemSecretKey,
            systemHmac: systemHmac,
            playerSelectedNumberY: playerSelectedNumberY
        };
    }
    static async conductFairGeneration(min, max, promptMessage, gameControllerInstance) {
        const commitMsg = `I selected a random value in the range ${min} to ${max} \n(HMAC={hmac}).\nTry to guess my selection.`;
        const revealMsg = `My selection was: {x} (KEY={key}).\nYou can use this number ({x}) and key ({key}) to verify the HMAC ({hmac}).`;
        const { finalResult, systemRandomNumberX, systemSecretKey, systemHmac, playerSelectedNumberY } = await GameProtocol.#performCommitRevealProtocol(
            min,
            max,
            commitMsg,
            revealMsg,
            promptMessage,
            gameControllerInstance
        );
        if (playerSelectedNumberY === systemRandomNumberX) {
            console.log('You guessed my selection! You make the first move.');
            return { playerGoesFirst: true, secretKey: systemSecretKey };
        } else {
            console.log('You did not guess. I make the first move.');
            return { playerGoesFirst: false, secretKey: systemSecretKey };
        }
    }
    static async conductDiceRollPhase(min, max, promptMessage, isPlayerRolling, gameControllerInstance) {
        const actorName = isPlayerRolling ? 'You' : 'Computer';
        const commitMsg = `--- Provably Fair Roll for ${actorName} ---\nI selected a random value in the range ${min} to ${max} \n(HMAC={hmac}).`;
        const revealMsg = `My selection was: {x} (KEY={key}).\nYou can use this number ({x}) and key ({key}) to verify the HMAC ({hmac}).`;
        const { finalResult, systemRandomNumberX, systemSecretKey, systemHmac, playerSelectedNumberY } = await GameProtocol.#performCommitRevealProtocol(
            min,
            max,
            commitMsg,
            revealMsg,
            promptMessage,
            gameControllerInstance
        );
        return finalResult;
    }
}
module.exports = GameProtocol;
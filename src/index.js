const Dice = require('./models/Dice');
const DiceConfigParser = require('./utils/DiceConfigParser');
const GameController = require('./game/GameController');
const GameProtocol = require('./game/GameProtocol');
const FairNumberGenerator = require('./utils/FairNumberGenerator');

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Error! No arguments passed");
        return;
    }
    if (args.length < 3) {
    console.error('Error ! A minimum of 3 dice is required to start the game.');
    process.exit(1);
}
    let dice = [];
    try {
        dice = DiceConfigParser.parseDice(args);
        console.log("Dice configuration successfully loaded:");
        dice.forEach((d, index) => {
            console.log(`Dice ${index}: ${d}`);
        });
    } catch (error) {
        console.error(error.message);
        return;
    }
    const gameController = new GameController(dice);

    console.log("Let's determine who makes the first move.");

    const { playerGoesFirst, secretKey } = await GameProtocol.conductFairGeneration(
        0,
        1,
        'Your choice:',
        gameController
        
    );

    let playerDiceOriginalIndex;
    let computerDiceOriginalIndex;

    let firstPicker = null;

    if (playerGoesFirst) {
        firstPicker = 'player';
        const availablePlayerDiceIndexes = gameController.getAvailableDiceIndexes();
        const playerDisplayChoice = await GameProtocol.askInputWithValidation(
            "Choose your dice:\nYour choice: ",
            availablePlayerDiceIndexes.map((_, i) => i),
            gameController,
            gameController.displayAvailableDice.bind(gameController)
        );
        playerDiceOriginalIndex = gameController.getOriginalDiceIndexFromDisplayIndex(playerDisplayChoice);

        console.log(`You choose the ${dice[playerDiceOriginalIndex].toString()} dice.`);

        const availableComputerDiceIndexes = gameController.getAvailableDiceIndexes([playerDiceOriginalIndex]);
        computerDiceOriginalIndex = gameController.getWinningDiceIndex(playerDiceOriginalIndex, availableComputerDiceIndexes);

        if (computerDiceOriginalIndex === null) {
            computerDiceOriginalIndex = availableComputerDiceIndexes[FairNumberGenerator.generateSecureRandomNumber(0, availableComputerDiceIndexes.length - 1)];

            console.log(`Warning: Computer could not find a winning dice against your choice. Computer chose dice with index ${computerDiceOriginalIndex} (${dice[computerDiceOriginalIndex].toString()})`);
        
        } else {

            console.log(`I choose the ${dice[computerDiceOriginalIndex].toString()} dice.`);

        }
    } else {
        firstPicker = 'computer';
        const allAvailableDiceIndexes = gameController.getAvailableDiceIndexes();
        gameController.lastAvailableDiceIndexes = allAvailableDiceIndexes;
        computerDiceOriginalIndex = gameController.getOptimalStartingDiceIndex();

        console.log(`I choose the ${dice[computerDiceOriginalIndex].toString()} dice.`);

        const availablePlayerDiceIndexes = gameController.getAvailableDiceIndexes([computerDiceOriginalIndex]);
        const playerDisplayChoice = await GameProtocol.askInputWithValidation(
            "Choose your dice:\nYour choice: ",
            availablePlayerDiceIndexes.map((_, i) => i),
            gameController,
            gameController.displayAvailableDice.bind(gameController)
        );
        playerDiceOriginalIndex = gameController.getOriginalDiceIndexFromDisplayIndex(playerDisplayChoice);
        if (playerDiceOriginalIndex === null) { //никогда тут не буду по сути. хай будет
            playerDiceOriginalIndex = availablePlayerDiceIndexes[0];
        } else {
            console.log(`You choose the ${dice[playerDiceOriginalIndex].toString()} dice.`);
        }
    }
    gameController.setDiceChoices(playerDiceOriginalIndex, computerDiceOriginalIndex);
    let playerRollFaceIndex;
    let computerRollFaceIndex;
    if (firstPicker === 'player') {
        playerRollFaceIndex = await GameProtocol.conductDiceRollPhase(
            0,
            dice[playerDiceOriginalIndex].faces.length - 1,
            'Your choice:',
            true,
            gameController
        );
        computerRollFaceIndex = await GameProtocol.conductDiceRollPhase(
            0,
            dice[computerDiceOriginalIndex].faces.length - 1,
            'Your choice:',
            false,
            gameController
        );

//
// node src/index.js       
// node src/index.js 2,2,4,4,9,9 6,8,1,1,8,6 
// node src/index.js 2,2,4,4,9,9 6,8,1,1,8,6 71,5,13,7,5,55,5,4
// node src/index.js 2,2,4,4,9,9 6,8,1,1,8,6 71,5,13,7,text
// node src/index.js 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6       с примера
// node src/index.js 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7                   с примера
// node src/index.js 1,1,1,1,1,1 2,2,2,2,2,2 3,3,3,3,3,3 4,4,4,4,4,4 5,5,5,5,5,555555
    } else {
        computerRollFaceIndex = await GameProtocol.conductDiceRollPhase(
            0,
            dice[computerDiceOriginalIndex].faces.length - 1,
            'Your choice:',
            false,
            gameController
        );
        playerRollFaceIndex = await GameProtocol.conductDiceRollPhase(
            0,
            dice[playerDiceOriginalIndex].faces.length - 1,
            'Your choice:',
            true,
            gameController
        );
    }
    gameController.playRound(computerRollFaceIndex, playerRollFaceIndex);
    console.log("Game over.");
}
main().catch(error => {
    console.error(`An critical error occurred: ${error.message}`);
});
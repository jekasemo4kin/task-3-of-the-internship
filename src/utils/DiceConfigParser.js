const Dice = require('../models/Dice');
class DiceConfigParser {
    static parseDice(args) {
        const dice = [];
        for (const arg of args) {
            const faces = arg.split(',').map(faceStr => { // итый (i число строк аргументов) массив с числами (рёбрами). Таких столько же сколько строк аргуменов
                const face = parseInt(faceStr.trim(), 10);
                if (isNaN(face)) {
                    throw new Error(`Error ! Invalid dice face '${faceStr}'. Faces must be numbers.`);
                }
                return face;
            });
            dice.push(new Dice(faces));
        }
        return dice; // массив типа Dice
    }
}

module.exports = DiceConfigParser;
class Dice {
    constructor(faces) { // faces массив с числами (рёбрами)
        if (faces.length !== 6) {
            throw new Error('Error ! The dice must have 6 numbered faces.');
        }
        this.faces = faces;
    }

    toString() {
        return this.faces.join(',');
    }
}

module.exports = Dice;
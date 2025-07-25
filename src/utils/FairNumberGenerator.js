const crypto = require('crypto');

class FairNumberGenerator {

    static generateSecretKey(bytes = 32) { // генерирует случайный, криптографически безопасный секретный ключ длиной 256 бит (или указанное количество бит) и возвращает его в виде шестнадцатеричной строки
        return crypto.randomBytes(bytes).toString('hex'); // генерирует криптографически сильные псевдослучайные данные (байт-буфер) указанной длины в байтах. Далее преобразование буфера в 16ричную стрингу
    }

    static generateSecureRandomNumber(min, max) {
        if (min > max) {
            throw new Error('Error ! The minimum value cannot be greater than the maximum.');
        }
        const range = max - min + 1;
        if (range <= 0) {
            throw new Error('Error ! The range must be positive.');
        }

        const bytesNeeded = 4;
        const randomBytes = crypto.randomBytes(bytesNeeded);
        const randomNumber = randomBytes.readUIntBE(0, bytesNeeded); // от нуля до потолка = (2^(32))-1    (0 до 4,294,967,295).
        const finalGeneratedNumber = min + (randomNumber % range);
        //console.log(`[DEBUG] Generated ${bytesNeeded} bytes: ${randomBytes.toString('hex')}`);
        //console.log(`[DEBUG]   randomNumber (unsigned integer): ${randomNumber}`);
        //console.log(`[DEBUG]   Range: ${range}`);
        //console.log(`[DEBUG] Final generated number (min + randomNumber % range): ${finalGeneratedNumber}`);

        return finalGeneratedNumber;
    }

    static calculateHmacSha3(message, key) { // computerValue и secretKey
        try {
            if (crypto.getHashes().includes('sha3-256')) { // true только для ноды старше или 12.0.0
                const hmac = crypto.createHmac('sha3-256', Buffer.from(key, 'hex')); // объект, но не хеш
                hmac.update(message.toString()); // "патчу" объект типа GMAC, передача данных в хешфункцию
                return hmac.digest('hex').toUpperCase(); // возвращение 16ричной строки HMAC
            } else {
                console.warn("Node.js crypto does not support 'sha3-256'. Using SHA256 for HMAC.");
                const hmac = crypto.createHmac('sha256', Buffer.from(key, 'hex'));
                hmac.update(message.toString());
                return hmac.digest('hex').toUpperCase();
            }
        } catch (e) {
            console.error(`\n! HMAC-SHA3-256 critical error!`);
            console.error(`Error ! ${e.message}`);
            console.error(`Detailed error information:`, e);
            throw e;
        }
    }
}
module.exports = FairNumberGenerator;
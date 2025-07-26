const crypto = require('crypto');
class FairNumberGenerator {
    static generateSecretKey(bytes = 32) {
        return crypto.randomBytes(bytes).toString('hex');
    }
    static calculateHmacSha3(message, key) {
        try {
            if (crypto.getHashes().includes('sha3-256')) {
                const hmac = crypto.createHmac('sha3-256', Buffer.from(key, 'hex'));
                hmac.update(message.toString());
                return hmac.digest('hex').toUpperCase();
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
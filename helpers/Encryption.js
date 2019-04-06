const crypto = require('crypto');
const config = require('../config');

function encrypt(text) {
    let algorithm = config.algorithm;
    let cryptoKey = config.cryptoKey;
    let cipher = crypto.createCipher(algorithm, cryptoKey);
    let encrypted = cipher.update(`${text}`, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
}

function decrypt(text){
    let algorithm = config.algorithm;
    let cryptoKey = config.cryptoKey;
    let encrypted = text;
    let decipher = crypto.createDecipher(algorithm, cryptoKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
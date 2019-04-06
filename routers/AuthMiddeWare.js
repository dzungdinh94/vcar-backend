
const jwt = require('jsonwebtoken');
const config = require('../config');
const cf = require('../helpers/CF');
const responseCode = require('../ResponseCode');
const models = require('../models');

function verifyAdmin(req, res, next) {
    // check header or url parameters or post parameters for1token
    let token = req.headers['x-access-token'];
    if (!token) return cf.sendData(res, 'NO_PERMISSION', 'No token provided', null, 403);
    // decode token
    jwt.verify(token, config.jwtKeyAdmin, (err, decoded) => {

        if (err) {
            if (err.name === "TokenExpiredError") return cf.sendData(res, 'JWT_TIMED_OUT', 'Session timed out.', null, responseCode.JWT_TIMED_OUT);
            return cf.sendData(res, 'NOT_AUTH', 'Token decode failed.', null, responseCode.NOT_AUTH);
        }
        req.user = decoded;
        next();

    });

}


function verifyMobile(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.headers['x-access-token'];
    if (!token) return cf.sendData(res, 'NO_PERMISSION', 'No token provided', null, 403);
    // decode token
    jwt.verify(token, config.jwtKeyMobile, (err, decoded) => {

        if (err) {
            if (err.name === "TokenExpiredError") return cf.sendData(res, 'JWT_TIMED_OUT', 'Session timed out.', null, responseCode.JWT_TIMED_OUT);
            return cf.sendData(res, 'NOT_AUTH', 'Token decode failed.', null, responseCode.NOT_AUTH);
        }
        req.user = decoded;
        next();

    });
}
function verifyMobileSocket(token, cb) {
    if (!token) return cb('No token provided');
    jwt.verify(token, config.jwtKeyMobile, (err, decoded) => cb(err, decoded));
}
function verifyAdminSocket(token, cb) {
    if (!token) return cb('No token provided');
    jwt.verify(token, config.jwtKeyAdmin, (err, decoded) => cb(err, decoded));
}

function verifyAdd(req, res, next) {
    if (req.permission.add == 1) return next();
    return cf.sendData(res, 'NO_PERMISSION', 'No token provided', null, 403);
}


exports.verifyAdmin = verifyAdmin;
exports.verifyMobile = verifyMobile;
exports.verifyMobileSocket = verifyMobileSocket;
exports.verifyAdminSocket = verifyAdminSocket;

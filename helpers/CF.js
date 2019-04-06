const axios = require('axios');
const config = require('../config');
const models = require('../models');
const _ = require('lodash');
const responseCode = require('../ResponseCode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');


function buildResponse(responseCode, responseText) {
    var response = new Object();
    response.ResponseCode = responseCode;
    response.ResponseText = responseText;

    return response;
}

exports.sendData = (res, code, mess, data, status) => {

    res.status(status || 200).send({
        ResponseCode: responseCode[code] || 0,
        ResponseText: `${mess}`,
        data
    })

}

exports.wirtelog = (data, route) => {
    fs.appendFile(
        path.join(__dirname, `../log/${moment().format('YYYY-MM-DD')}.txt`),
        `${moment().format('HH:mm:ss')} ${route} \n++ ${JSON.stringify(data)} \n-------------------------- \n`,
        (err, data) => { }
    )
}

//to: FCMID, neu push den topics thi phai de duoi dang /topics/{ten_topic}
function pushNotification(title, body, to) {
    let json = {}
    json.priority = 'high';
    json.notification = {};
    json.notification.title = title;
    json.notification.click_action = 'OPEN_ACTIVITY';
    json.notification.body = body;
    json.notification.content_available = true;
    json.notification.icon = 'icon_notification';
    json.notification.sound = 'mySound';
    json.to = to;

    var instance = axios.create({
        baseURL: 'https://fcm.googleapis.com',
        timeout: 50000,
        headers: { 'Authorization': 'key=' + config.firebaseAuthorizationKey }
    });
    instance.post('/fcm/send', json).then(function (response) {
        //callback(response);
    }).catch(function () {
        console.log("Promise Rejected");
    });
}

exports.upload = (req, res, callback) => {
    let fileName = ""
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/')
        },
        filename: function (req, file, cb) {
            let filetypes = /xls|xlsx/;
            let mimetype = filetypes.test(file.mimetype);
            let extname = filetypes.test(path.extname(file.originalname));
            if (mimetype || extname) {
                fileName = Math.random().toString(36).substring(7) + path.extname(file.originalname).toLowerCase()
                cb(null, fileName);
            } else {
                cb('Định dạng không hỗ trợ')
            }
        }
    })
    let upload = multer({ storage }).array('files', 1);
    upload(req, res, (err, data) => {
        if (err) return callback(err)
        if (req.files) return callback(null, fileName, data)
        callback('Không thê upload file, vui lòng thử lại')
    });
}


const boDauTiengViet = (str) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}
exports.boDauTiengViet = boDauTiengViet;


//to: FCMID, neu push den topics thi phai de duoi dang /topics/{ten_topic}
function pushNotificationWithData(title, body, to, data) {
    let json = {}
    json.priority = 'high';
    json.notification = {};
    json.notification.title = title;
    json.notification.click_action = 'OPEN_ACTIVITY';
    json.notification.body = body;
    json.notification.content_available = true;
    json.notification.icon = 'icon_notification';
    json.notification.sound = 'mySound';
    json.to = Array.isArray(to) ? to : boDauTiengViet(to);
    json.data = data;

    let instance = axios.create({
        baseURL: 'https://fcm.googleapis.com',
        timeout: 50000,
        headers: { 'Authorization': 'key=' + config.firebaseAuthorizationKey }
    });
    instance.post('/fcm/send', json).then(function (response) {
        // callback(response);
        // console.log(response)
    }).catch(function () {
        console.log("Promise Rejected");
    });
}


function SubscribeFcmIdToTopic(req, fcmIds, topic, phoneNumber, callback) {
    let admin = req.app.locals.admin;
    topic = boDauTiengViet(topic)

    if (fcmIds && fcmIds.length > 0) {
        admin.messaging()
            .subscribeToTopic(fcmIds, topic)
            .then(function (response) {


                callback(response)
            })
            .catch(function (error) {
                callback(error)
            });
    } else {
        callback('FCMID is NULL')
    }
}
function UnSubscribeFcmIdToTopic(req, fcmIds, topic, callback) {
    let admin = req.app.locals.admin;
    topic = boDauTiengViet(topic);
    // Subscribe the device corresponding to the registration token to the
    // topic. max subscribe is 1000 so we need to split

    if (fcmIds && fcmIds.length > 0) {
        admin.messaging().unsubscribeFromTopic(fcmIds, topic)
            .then(function (response) {
                callback(response)
            })
            .catch(function (error) {
                callback(error)
            });
    } else {
        callback('FCMID is NULL')
    }
}

function checkDate(str) {
    let isMatch = str.match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/);
    if (isMatch) {
        return '';
    } else {
        return 'Ngày không đúng định dạng dd/MM/yyyy';
    }
}

function checkSex(str) {
    let checklen = checkLength(studentId, 'Giới tính');
    if (checklen.length > 0) {
        return checklen;
    } else {
        if (_.toLower(_.trim(str)) === 'nam' || _.toLower(_.trim(str)) === 'nữ') {
            return '';
        } else {
            return 'Giới tính không đúng định dạng ( Nam | Nữ )';
        }
    }
}

function checkLength(input, text) {
    if (input.length == 0) {
        return text + ' không được để trống';
    } else if (input.length > 255) {
        return text + ' không được dài quá 255 ký tự';
    } else {
        return '';
    }
}

exports.SubscribeFcmIdToTopic = SubscribeFcmIdToTopic;
exports.UnSubscribeFcmIdToTopic = UnSubscribeFcmIdToTopic;
exports.pushNotificationWithData = pushNotificationWithData;
exports.pushNotification = pushNotification;
exports.buildResponse = buildResponse;
exports.checkDate = checkDate;
exports.checkSex = checkSex;
exports.checkLength = checkLength;
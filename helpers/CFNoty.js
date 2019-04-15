const config = require('../config');
const models = require('../models');
const _ = require('lodash');
const moment = require('moment');


const admin = require("firebase-admin");
const serviceAccount = require("../devvcar-d15f2-firebase-adminsdk-8y60a-46976d5b39.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://devvcar-d15f2.firebaseio.com"
});

const convertPayload = ({ title, body, data }) => {

  const notification = {
    title,
    body,
    click_action: "OPEN_ACTIVITY",
    content_available: "true",
    icon: 'ic_launcher',
    large_icon: 'ic_launcher',
    sound: "default",
    vibrate: "300",
    show_in_foreground: "true",
    priority: 'hight',
    auto_cancel: "true",
  }

  const customData = {
    data,
    show_in_foreground: true,
    priority: 'hight',
    auto_cancel: true,
    content_available: true,
    vibrate: 300,
    lights: true,
    ...notification
  }
  return {
    notification,
    data: {
      type: "MEASURE_CHANGE",
      custom_notification: JSON.stringify(customData)
    }
  }
}


exports.pushNotiWithFcmId = ({ title, body, data, fcmIds }, cb) => {
  let payload = convertPayload({ title, body, data })
  fcmIds = fcmIds.filter(v => !!v)
  admin.messaging()
    .sendToDevice(fcmIds, payload)
    .then(res => {
      console.log('nt--------res', res)
      if (cb) cb(null, res)
    })
    .catch((error) => {
      if (cb) cb(error)
    });
}
exports.sendToTopic = ({ title, body, data, topic }, cb) => {
  let payload = convertPayload({ title, body, data })
  admin.messaging()
    .sendToTopic(topic, payload)
    .then(res => {
      if (cb) cb(null, res)
    })
    .catch((error) => {
      if (cb) cb(error)
    });
}

exports.subscribeToTopic = (fcmId, topic, cb) => {
  admin.messaging().subscribeToTopic(fcmId, topic)
    .then((response) => {
      cb(null, response)
    })
    .catch((error) => {
      cb(error)
    });
}
const express = require('express');
const bodyParser = require('body-parser');
const config = require('../../config');
const cf = require('../../helpers/CF');
const cfNoty = require('../../helpers/CFNoty');
const cors = require('cors');
const AuthMiddeWare = require('../AuthMiddeWare');
const router = express.Router();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const models = require('../../models')
const Encrypt = require('../../helpers/Encryption')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken')


//../routeName
router.use(cors());

const user = require('./user')
const driver = require('./driver')
const UserController = require('./UserController')
const DriverController = require('./DriverController')
const TypeCarController = require('./TypeCarController')
const PriceTimeSlotController = require('./PriceTimeSlotController')
const NotificationController = require('./NotificationController')
const OrderController = require('./OrderController')
const ServiceAttachController = require('./ServiceAttachController')
const Price = require('./Price')

router.use('/user', user)
router.use('/user', UserController)
router.use('/driver', driver)
router.use('/driver', DriverController)
router.use('/typecar', TypeCarController)
router.use('/pricetimeslot', PriceTimeSlotController)
router.use('/notify', NotificationController)
router.use('/order', OrderController)
router.use('/serviceattach', ServiceAttachController)
router.use('/price', Price)

router.post('/subscribeToTopic', jsonParser, (req, res) => {
  let { type, fcmId } = req.body;
  cfNoty.subscribeToTopic(fcmId, type, (err, data) => {
    if (!err) return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  })
  cfNoty.subscribeToTopic(fcmId, 'all', (err, data) => { })

})

router.use('/info', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.get('/info', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  const inforTable = userType == config.userType.user ? models.User : models.Driver
  let arrAtr = userType == config.userType.user ? [] : ['numberCar', 'status', 'typeCarId', 'rate'];
  inforTable.find({
    where: { id },
    attributes: ['id', 'email', 'phone', 'avatar', 'fullname', ...arrAtr]
  }).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'user is not exist') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

})

router.use('/logout', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.post('/logout', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  models.FcmId.destroy({
    where: {
      userId: id,
      fcmId,
      type: userType
    }
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

router.use('/updateinfo', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.post('/updateinfo', jsonParser, (req, res, next) => {
  const { email, phone, fullname, avatar, numberCar } = req.body;
  const { id, fcmId, type, userType } = req.user;
  const inforTable = userType == config.userType.user ? models.User : models.Driver;
  let objectUpdate = {}
  if (!!email) objectUpdate.email = email;
  if (!!phone) objectUpdate.phone = phone;
  if (!!fullname) objectUpdate.fullname = fullname;
  if (!!avatar) objectUpdate.avatar = avatar;
  if (userType == config.userType.driver) {
    if (!!numberCar) objectUpdate.numberCar = numberCar;
  }
  inforTable.update(
    { ...objectUpdate },
    { where: { id } }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

// router.use('/changepass', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
// router.post('/changepass', jsonParser, (req, res, next) => {
//   const { newPassword, oldPassword } = req.body
//   const { id, fcmId, type, userType } = req.user;
//   const inforTable = userType == config.userType.user ? models.User : models.Driver
//   inforTable.update(
//     { password: Encrypt.encrypt(newPassword) },
//     { where: { id, password: Encrypt.encrypt(oldPassword) } }
//   ).then(data => {
//     if (!data[0]) return cf.sendData(res, 'ERROR', 'change pass faild') //ERROR  
//     return cf.sendData(res, 'SUCCESS', 'SUCCESS', data[0]) //ERROR
//   }).catch((err) => {
//     cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
//   });
// })


const account_kit_api_version = '{{ACCOUNT_KIT_API_VERSION}}';
const app_id = '{{FACEBOOK_APP_ID}}';
const app_secret = '{{ACCOUNT_KIT_APP_SECRET}}';
const me_endpoint_base_url = 'https://graph.accountkit.com/{{ACCOUNT_KIT_API_VERSION}}/me';
const token_exchange_base_url = 'https://graph.accountkit.com/{{ACCOUNT_KIT_API_VERSION}}/access_token';


let a = {
  "appId": "953294158187135",
  "accountId": "259201681601849",
  "refreshIntervalSeconds": 2592000,
  "token": "EMAWeFvZCnhteOQWSZA7PhGwBVUsadZBPBcdM9sBrscFdy3LFKVGJ0YgSANcR8oxF4TpmGu0Bir2F26s1O3CiyZAdvT2M1pE3omoFhWxsEQQZDZD",
  "lastRefresh": 1537282806868.269
}

router.post('/login_accountkit', jsonParser, (req, res) => {

  let { code, csrf } = req.body
  // CSRF check
  let app_access_token = ['AA', app_id, app_secret].join('|');
  let params = `grant_type=authorization_code&code=${code}&access_token=${app_access_token}`

  // exchange tokens
  let token_exchange_url = token_exchange_base_url + '?' + params;




  // Request.get({ url: token_exchange_url, json: true }, function (err, resp, respBody) {
  //   var view = {
  //     user_access_token: respBody.access_token,
  //     expires_at: respBody.expires_at,
  //     user_id: respBody.id,
  //   };

  //   // get account details at /me endpoint
  //   var me_endpoint_url = me_endpoint_base_url + '?access_token=' + respBody.access_token;
  //   Request.get({ url: me_endpoint_url, json: true }, function (err, resp, respBody) {
  //     // send login_success.html
  //     if (respBody.phone) {
  //       view.phone_num = respBody.phone.number;
  //     } else if (respBody.email) {
  //       view.email_addr = respBody.email.address;
  //     }
  //   });
  // });
});


module.exports = router;
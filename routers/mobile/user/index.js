const express = require('express');
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cors = require('cors');

const config = require('../../../config');
const cf = require('../../../helpers/CF');
const AuthMiddeWare = require('../../AuthMiddeWare');
const models = require('../../../models')
const Encrypt = require('../../../helpers/Encryption')

const jsonParser = bodyParser.json();
const router = express.Router();
const Op = Sequelize.Op;


//../routeName
router.use(cors());

router.post('/login', jsonParser, (req, res, next) => {
  const { email, phone, password, fullname, avatar, fcmId, idfacebook } = req.body
  // console.log(fcmId,"fcmId server");
  console.log(phone,idfacebook,"server")
  if (!phone && !idfacebook) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  if (!fcmId) return cf.sendData(res, 'ERROR', 'Chưa có fcmid');
  let objectWhere = {}
  if (!!idfacebook) objectWhere.idfacebook = idfacebook
  else objectWhere.phone = phone;
  models.User.findOrCreate({
    where: objectWhere,
    defaults: {
      // email,
      phone,
      idfacebook,
      // password: Encrypt.encrypt(password),
      fullname,
      avatar
    }
  }).spread((data, isCreate) => {
    // if (!isCreate) return cf.sendData(res, 'ERROR', 'data is exist') //ERROR  
    models.FcmId.findOrCreate({
      where: { userId: data.id, fcmId },
      defaults: { userId: data.id, fcmId, type: config.userType.user }
    }).spread((data, isCreate) => { }).catch(err=>{
      console.log(err)
    })

    let token = jwt.sign({
      fcmId,
      id: data.id,
      type: data.type,
      userType: config.userType.user
    }, config.jwtKeyMobile);
    let { id, username, fullname, avatar, type, phone, idfacebook } = data
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', {
      id, username,
      fullname, avatar,
      type, token,
      idfacebook,
      phone
    }) //ERROR
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    return cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

})

router.post('/signin', jsonParser, (req, res, next) => {
  const { email, phone, password, fullname, avatar } = req.body
  models.User.findOrCreate({
    where: {
      phone
    },
    defaults: {
      // email,
      // password: Encrypt.encrypt(password),
      phone,
      fullname,
      avatar,
    }
  }).spread((data, isCreate) => {
    if (!isCreate) return cf.sendData(res, 'ERROR', 'data is exist') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    return cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

})


module.exports = router;
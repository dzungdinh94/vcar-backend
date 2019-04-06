const express = require('express');
const bodyParser = require('body-parser');
const config = require('../../config');
const cf = require('../../helpers/CF');
const cors = require('cors');
const AuthMiddeWare = require('../AuthMiddeWare');
const router = express.Router();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const models = require('../../models')
const Encrypt = require('../../helpers/Encryption')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//../routeName
router.use(cors());
router.use('/', (req, res, next) => {
  AuthMiddeWare.verifyMobile(req, res, next);
});
router.post('/infouser', jsonParser, (req, res, next) => {
  const { id } = req.body
  models.User.find({
    where: { id },
    attributes: ['id', 'email', 'phone', 'avatar', 'fullname']
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

router.get('/orderunfinished', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  models.Order.findAll({
    where: {
      status: { [Op.in]: [0, 1] },
      userId: id
    },
    raw: true
  }).then(data => {
    // if (data && data.id) {
    //   data.serviceAttach = await models.ServiceAttachOrder.findAll({
    //     where: {
    //       orderId: data.id
    //     },
    //     raw: true
    //   })
    //   data.total = parseInt(data.price) + [...dataOrder.serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
    // }
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });



})

module.exports = router;
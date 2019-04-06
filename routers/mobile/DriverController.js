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
const socket = require('../socket')

//../routeName
router.use(cors());

router.use('/', (req, res, next) => {
  AuthMiddeWare.verifyMobile(req, res, next);
});
router.post('/infodriver', jsonParser, (req, res, next) => {
  const { id } = req.body
  models.Driver.find({
    where: { id },
    attributes: ['id', 'email', 'phone', 'avatar', 'fullname', 'numberCar', 'latitude', 'longitude']
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})
router.post('/updatelocation', jsonParser, (req, res, next) => {
  const { longitude, latitude } = req.body;
  const { id, fcmId, type, userType } = req.user;
  if (userType != config.userType.driver) return cf.sendData(res, 'ERROR', 'Bạn ko phải lái xe');
  if (!longitude && !latitude) return cf.sendData(res, 'ERROR', 'Không có data')
  models.Driver.update(
    { longitude, latitude },
    { where: { id } }
  ).then(data => {

    socket.pushAllUserOnline({ latitude, longitude, id }, 'driverchangelocation')



    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})
router.get('/statusorder', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  models.OrderOfDriver.findAll({
    where: { driverId: id, status: 0 },
    raw: true
  }).then(async data => {
    let dataOrder = await models.Order.find({ where: { id: data[0] ? data[0].orderId : 0 }, raw: true })
    if (dataOrder && dataOrder.id) {
      dataOrder.serviceAttach = await models.ServiceAttachOrder.findAll({
        where: {
          orderId: dataOrder.id
        },
        raw: true
      })
      dataOrder.total = parseInt(dataOrder.price) + [...dataOrder.serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
    }

    cf.sendData(res, 'SUCCESS', 'SUCCESS', {
      status: !!data.length,
      data: dataOrder
    })
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });


})

module.exports = router;
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
router.use('/', (req, res, next) => AuthMiddeWare.verifyAdmin(req, res, next));


router.post('/getall', jsonParser, (req, res, next) => {
  let { page, search, typeCarId } = req.body;
  page = page || 1;
  page = page - 1
  search = search || '';
  let objectWhere = {}
  if (!!typeCarId) objectWhere.typeCarId = typeCarId
  models.PriceTimeSlot.findAndCountAll({
    where: {
      ...objectWhere,
      [Op.or]: {
        startTime: { [Op.like]: `%${search}%` },
        endTime: { [Op.like]: `%${search}%` },
        price: { [Op.like]: `%${search}%` },
      },
    },
    offset: page * config.pageLimit,
    limit: config.pageLimit,
    // attributes: ['id', 'email', 'phone', 'avatar', 'fullname']
  }).then(data => {
    let { count, rows } = data
    console.log(data,"data price");
    console.log("ahihi");
    cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});

router.post('/create', jsonParser, (req, res, next) => {
  let { typeCarId, startTime, endTime, price } = req.body
  if (!typeCarId || !startTime || !endTime || !price) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.PriceTimeSlot.create({
    typeCarId,
    startTime,
    endTime,
    price
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

router.post('/update', jsonParser, (req, res, next) => {
  let { id, startTime, endTime, price, typeCarId } = req.body
  let objectUpdate = {}
  if (!!startTime) objectUpdate.startTime = startTime;
  if (!!endTime) objectUpdate.endTime = endTime
  if (!!price) objectUpdate.price = price
  if (!!typeCarId) objectUpdate.typeCarId = typeCarId
  models.PriceTimeSlot.update(
    { ...objectUpdate },
    { where: { id } }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

router.post('/delete', jsonParser, (req, res, next) => {
  let { id } = req.body
  if (!id) return cf.sendData(res, 'ERROR', 'ERROR');
  if (typeof (id) == 'object' && id.length > 0) {
    models.PriceTimeSlot.destroy({
      where: { id },
    }).then(data => {
      cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  } else {
    models.PriceTimeSlot.findById(id).then(data => {
      if (!data) return cf.sendData(res, 'ERROR', 'PriceTimeSlot is not exist')
      data.destroy();
      return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  }
})

module.exports = router;
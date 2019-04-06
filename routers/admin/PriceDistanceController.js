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
  let { page, search, priceTimeSlotId } = req.body;
  page = page || 1;
  page = page - 1
  search = search || '';
  let objectWhere = {}
  if (!!priceTimeSlotId) objectWhere.priceTimeSlotId = priceTimeSlotId
  models.PriceDistance.findAndCountAll({
    where: {
      ...objectWhere,
      [Op.or]: {
        startDistance: { [Op.like]: `%${search}%` },
        endDistance: { [Op.like]: `%${search}%` },
        price: { [Op.like]: `%${search}%` },
      },
    },
    order: [['endDistance', 'ASC']],
    // offset: page * config.pageLimit,
    // limit: config.pageLimit,
    // attributes: ['id', 'email', 'phone', 'avatar', 'fullname']
  }).then(data => {
    let { count, rows } = data
    cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: 1 /* Math.ceil(count / config.pageLimit) */, rows }) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});

router.post('/create', jsonParser, (req, res, next) => {
  let { priceTimeSlotId,
    startDistance = 0,
    endDistance,
    price, } = req.body
  if (!priceTimeSlotId || !endDistance || !price) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.PriceDistance.create({
    priceTimeSlotId,
    startDistance,
    endDistance,
    price,
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

router.post('/update', jsonParser, (req, res, next) => {
  let { id, priceTimeSlotId,
    startDistance = 0,
    endDistance,
    price, } = req.body
  let objectUpdate = {}
  if (!!priceTimeSlotId) objectUpdate.priceTimeSlotId = priceTimeSlotId;
  if (!!startDistance) objectUpdate.startDistance = startDistance
  if (!!endDistance) objectUpdate.endDistance = endDistance
  if (!!price) objectUpdate.price = price
  models.PriceDistance.update(
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
    models.PriceDistance.destroy({
      where: { id },
    }).then(data => {
      cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  } else {
    models.PriceDistance.findById(id).then(data => {
      if (!data) return cf.sendData(res, 'ERROR', 'PriceDistance is not exist')
      data.destroy();
      return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  }
})

module.exports = router;
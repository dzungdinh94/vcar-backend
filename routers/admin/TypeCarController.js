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
  let { page, search, isAll } = req.body;
  page = page || 1;
  page = page - 1
  search = search || '';
  models.TypeCar.findAndCountAll({
    where: {
      // status: 1,
      [Op.or]: {
        name: { [Op.like]: `%${search}%` },
        description: { [Op.like]: `%${search}%` },
      }
    },
    offset: !!isAll ? 0 : page * config.pageLimit,
    limit: !!isAll ? 1000 : config.pageLimit,
    // attributes: ['id', 'email', 'phone', 'avatar', 'fullname']
  }).then(data => {
    let { count, rows } = data
    cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
});

router.post('/create', jsonParser, (req, res, next) => {
  let { name, description, weight, img1x, img2x, img3x, icon } = req.body
  if (!name || !img1x || !img2x || !img3x || !icon) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.TypeCar.create({ name, description, weight, icon, img1x, img2x, img3x }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

router.post('/update', jsonParser, (req, res, next) => {
  let { id, name, description, weight, icon, img1x, img2x, img3x } = req.body
  let objectUpdate = {}
  if (!!name) objectUpdate.name = name;
  if (!!description) objectUpdate.description = description
  if (!!weight) objectUpdate.weight = weight
  if (!!img1x) objectUpdate.img1x = img1x
  if (!!img2x) objectUpdate.img2x = img2x
  if (!!img3x) objectUpdate.img3x = img3x
  if (!!icon) objectUpdate.icon = icon
  models.TypeCar.update(
    { ...objectUpdate },
    {
      where: { id },
      // returning: true,
    }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

router.post('/delete', jsonParser, (req, res, next) => {
  let { id } = req.body
  if (!id) return cf.sendData(res, 'ERROR', 'ERROR');
  if (typeof (id) == 'object' && id.length > 0) {
    models.TypeCar.destroy({
      where: { id },
    }).then(data => {
      cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  } else {
    models.TypeCar.findById(id).then(data => {
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
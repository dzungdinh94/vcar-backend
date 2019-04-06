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
const cfNoty = require('../../helpers/CFNoty')

//../routeName
router.use(cors());
router.use('/', (req, res, next) => AuthMiddeWare.verifyAdmin(req, res, next));


router.post('/getall', jsonParser, (req, res, next) => {
  let { page, search } = req.body;
  page = page || 1;
  page = page - 1
  search = search || '';
  let objectWhere = {}
  models.Notification.findAndCountAll({
    where: {
      ...objectWhere,
      [Op.or]: {
        title: { [Op.like]: `%${search}%` },
        content: { [Op.like]: `%${search}%` },
      },
    },
    offset: page * config.pageLimit,
    limit: config.pageLimit,
    order: [['id', 'DESC']],
    // attributes: ['id', 'email', 'phone', 'avatar', 'fullname']
  }).then(data => {
    let { count, rows } = data
    cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});

router.post('/create', jsonParser, (req, res, next) => {
  const { id, fcmId, userType } = req.user;
  let { title, content, description, status, type, userId, url, image } = req.body
  if (!title || !content) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.Notification.create({
    title,
    content,
    description,
    type,
    userId: userId || 0,
    status,
    image,
    url,
    userCreated: id
  }).then(data => {

    let topic = "all"
    if (type == 1) topic = "user"
    else if (type == 2) topic = "driver"

    cfNoty.sendToTopic({ title, body: content, data: { ...data, typeNoti: 'notification' }, topic, typeNoti: 'notification' })
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
  models.Notification.update(
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
    models.Notification.destroy({
      where: { id },
    }).then(data => {
      cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  } else {
    models.Notification.findById(id).then(data => {
      if (!data) return cf.sendData(res, 'ERROR', 'Notification is not exist')
      data.destroy();
      return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  }
})

module.exports = router;
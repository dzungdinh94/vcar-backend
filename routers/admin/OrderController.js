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
const moment = require('moment')

//../routeName
router.use(cors());
router.use('/', (req, res, next) => AuthMiddeWare.verifyAdmin(req, res, next));


router.post('/getall', jsonParser, (req, res, next) => {
  let { page, search, status, typeCarId } = req.body;
  page = page || 1;
  page = page - 1
  search = search || '';
  let objWhere = {}
  // if (!!typeCarId) objWhere.typeCarId = typeCarId;
  if (status == "0" || status == "1") objWhere.status = status;

  models.Order.findAndCountAll({
      where: {
          // status: 1,
          // ...objWhere,
          [Op.or]: {
              // email: { [Op.like]: `%${search}%` },
              fromLocation: { [Op.like]: `%${search}%` },
              toLocation: { [Op.like]: `%${search}%` },
              price: { [Op.like]: `%${search}%` },
          }
      },
      offset: page * config.pageLimit,
      limit: config.pageLimit,
      attributes: ['id', 'fromLocation', 'toLocation', 'description', 'status', 'createdAt','price','typeCarId' ],
      order: [['id', 'DESC']],
  }).then(data => {
      let { count, rows } = data
      cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
  }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
});
// router.post('/create', jsonParser, (req, res, next) => {
//   const { id, fcmId, userType } = req.user;
//   let { title, content, description, status, type, userId } = req.body
//   if (!title || !content) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
//   models.Order.create({
//     title,
//     content,
//     description,
//     type,
//     userId: userId || 0,
//     status,
//     userCreated: id
//   }).then(data => {



//     //push notify to fcmid
//     cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
//   }).catch((err) => {
//     cf.wirtelog(err, module.filename)
//     cf.sendData(res, 'ERROR', 'ERROR', err)
//   });
// })

// router.post('/update', jsonParser, (req, res, next) => {
//   let { id, startTime, endTime, price, typeCarId } = req.body
//   let objectUpdate = {}
//   if (!!startTime) objectUpdate.startTime = startTime;
//   if (!!endTime) objectUpdate.endTime = endTime
//   if (!!price) objectUpdate.price = price
//   if (!!typeCarId) objectUpdate.typeCarId = typeCarId
//   models.Notification.update(
//     { ...objectUpdate },
//     { where: { id } }
//   ).then(data => {
//     cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
//   }).catch((err) => {
//     cf.wirtelog(err, module.filename)
//     cf.sendData(res, 'ERROR', 'ERROR', err)
//   });
// })

// router.post('/delete', jsonParser, (req, res, next) => {
//   let { id } = req.body
//   if (!id) return cf.sendData(res, 'ERROR', 'ERROR');
//   if (typeof (id) == 'object' && id.length > 0) {
//     models.Notification.destroy({
//       where: { id },
//     }).then(data => {
//       cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
//     }).catch((err) => {
//       cf.wirtelog(err, module.filename)
//       cf.sendData(res, 'ERROR', 'ERROR', err)
//     });
//   } else {
//     models.Notification.findById(id).then(data => {
//       if (!data) return cf.sendData(res, 'ERROR', 'Notification is not exist')
//       data.destroy();
//       return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
//     }).catch((err) => {
//       cf.wirtelog(err, module.filename)
//       cf.sendData(res, 'ERROR', 'ERROR', err)
//     });
//   }
// })

router.post('statisticorder', jsonParser, (req, res, next) => {
  let { startDate, endDate } = req.body
  let sql = `SELECT dr.id, dr.fullname, dr.numberCar, dr.phone
    COUNT(od.id) as totalOrder, SUM(od.price) AS totalMoney 
    FROM OrderOfDrivers AS odod 
    INNER JOIN Orders AS od ON odod.orderId = od.id
    INNER JOIN Drivers AS dr ON dr.id = odod.driverId
    WHERE odod.status = 1
    AND odod.endTime > '${startDate}'
    AND odod.endTime < '${moment(endDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD')}'
    GROUP BY odod.driverId`;
  models.sequelize.query(
    sql,
    { replacements: [], type: models.sequelize.QueryTypes.SELECT }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})



module.exports = router;
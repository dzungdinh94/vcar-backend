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
router.use('/getall', (req, res, next) => {
  let token = req.headers['x-access-token'];
  if (!token) {
    let { page } = req.body;
    page = !!page ? page - 1 : 0;
    models.Notification.findAll({
      where: {
        type: {
          [Op.in]: [0, 1]
        },
        userId: 0
      },
      offset: page * config.pageLimit,
      limit: config.pageLimit,
      order: [['id', 'DESC']],
      attributes: ['id', 'title', 'content', 'image', 'url', 'createdAt']
    }).then(data => {
      cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
      cf.wirtelog(err, module.filename)
      cf.sendData(res, 'ERROR', 'ERROR', err)
    });
  } else {
    AuthMiddeWare.verifyMobile(req, res, next)
  }
});

router.post('/getall', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { page } = req.body;
  page = !!page ? page - 1 : 0;
  models.sequelize.query(
    `SELECT  nt.id, nt.title, nt.content, nt.image, nt.url, nt.createdAt FROM Notifications AS nt 
    WHERE nt.type in (0, ?)
    AND nt.userId in (0, ?)
    ORDER BY nt.id DESC
    LIMIT ${config.pageLimit} OFFSET ${page * config.pageLimit} `,
    { replacements: [userType, id], type: models.sequelize.QueryTypes.SELECT }
  ).then(async data => {
    let dataSend = await Promise.all([...data].map(async (v, k) => {
      v.status = (await models.UserReadNotification.findAll({
        where: {
          notiId: v.id,
          userId: id,
          type: userType
        },
        raw: true
      })).length
      return v;
    }))
    cf.sendData(res, 'SUCCESS', 'SUCCESS', dataSend)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

});

router.post('/getdetails', jsonParser, (req, res, next) => {
  let { id } = req.body
  models.Notification.findById(id).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});

router.use('/read', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.post('/read', jsonParser, (req, res, next) => {
  const { id, fcmId, userType } = req.user;
  const { notiId } = req.body;
  if (!notiId) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.UserReadNotification.findOrCreate({
    where: { notiId, userId: id, type: userType },
    defaults: {
      notiId,
      userId: id,
      type: userType,
      status: 1
    }
  }).spread((data, isCreate) => {
    if (!isCreate) return cf.sendData(res, 'ERROR', 'data is exist')
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

router.use('/count', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.post('/count', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  models.sequelize.query(
    `SELECT count(nt.id) as total FROM Notifications AS nt 
    LEFT OUTER JOIN UserReadNotifications AS urnt ON nt.id = urnt.notiId 
    WHERE nt.type in (${userType},2)
    AND nt.userId in (0,${id})
    AND urnt.status is NULL `,
    { replacements: [], type: models.sequelize.QueryTypes.SELECT }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data[0])
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})


module.exports = router;
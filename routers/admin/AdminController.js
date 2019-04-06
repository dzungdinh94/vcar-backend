const express = require('express');
const bodyParser = require('body-parser');
const config = require('../../config');
const cf = require('../../helpers/CF');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// router.use('/',  (req, res, next) => {
//     AuthMiddeWare.AuthMiddeware(req, res, next);
// });


router.post('/login', jsonParser, (req, res, next) => {
  let { username, password } = req.body;
  models.Admin.find({
    where: {
      [Op.or]: {
        username,
        phone: username,
        email: username
      },
      password: Encrypt.encrypt(password)
    },
    attributes: ['id', 'username', 'fullname', 'avatar', 'email', 'type']
  }).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'username or password wrong') //ERROR  
    let token = jwt.sign({
      id: data.id,
      type: data.type,
      user: 'Admin'
    }, config.jwtKeyAdmin);
    let { id, username, fullname, avatar, email, type } = data
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', {
      id, username, fullname, avatar, email, type, token
    })
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

});
router.post('/getall', jsonParser, (req, res, next) => {
  let { page, search } = req.body;
  page = page || 1;
  page = page - 1
  search = search || '';
  models.Admin.findAndCountAll({
    where: {
      status: 1,
      type: 0,
      username: { [Op.not]: 'Admin' },
      [Op.or]: {
        email: { [Op.like]: `%${search}%` },
        phone: { [Op.like]: `%${search}%` },
        fullname: { [Op.like]: `%${search}%` },
      }
    },
    offset: page * config.pageLimit,
    limit: config.pageLimit,
    attributes: ['id', 'email', 'phone', 'avatar', 'fullname', 'type']
  }).then(data => {
    let { count, rows } = data
    cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
});
router.post('/create', jsonParser, (req, res, next) => {
  let { username, email, password, fullname, avatar } = req.body
  if (!name) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.Admin.findOrCreate({
    where: {
      [Op.or]: { email, username }
    },
    defaults: {
      email,
      password: Encrypt.encrypt(password),
      fullname,
      avatar
    }
  }).spread((data, isCreate) => {
    if (!isCreate) return cf.sendData(res, 'ERROR', 'data is exist') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    return cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})
router.post('/getone', jsonParser, (req, res, next) => {
  models.Admin.find({
    where: { id },
    attributes: ['id', 'email', 'phone', 'avatar', 'fullname'],
    // raw: true
  }).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'Admin is not exist') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})
router.post('/update', jsonParser, (req, res, next) => {
  let { id, email, phone, password, fullname, avatar } = req.body
  let objectUpdate = {}
  if (!!email) objectUpdate.email = email;
  if (!!phone) objectUpdate.phone = phone;
  if (!!fullname) objectUpdate.fullname = fullname;
  if (!!avatar) objectUpdate.avatar = avatar;
  if (!!password) objectUpdate.password = Encrypt.encrypt(password);
  models.Admin.update(
    { ...objectUpdate },
    { where: { id } }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})
router.post('/delete', jsonParser, (req, res, next) => {
  models.Admin.findById(2).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'Admin is not exist') //ERROR  
    data.destroy();
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})
router.post('/changepass', jsonParser, (req, res, next) => {
  let { newPassword, oldPassword } = req.body
  models.Admin.update(
    { password: Encrypt.encrypt(newPassword) },
    { where: { id: 1, password: Encrypt.encrypt(oldPassword) } }
  ).then(data => {
    if (!data[0]) return cf.sendData(res, 'ERROR', 'change pass faild') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data[0]) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})



module.exports = router;
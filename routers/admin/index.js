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


const AdminController = require('./AdminController')
const UserController = require('./UserController')
const PostsController = require('./PostsController')

const DriverController = require('./DriverController')
const TypeCarController = require('./TypeCarController')
const PriceTimeSlotController = require('./PriceTimeSlotController')
const PriceDistanceController = require('./PriceDistanceController')
const ServiceAttachController = require('./ServiceAttachController')
const NotificationController = require('./NotificationController')
const OrderController = require('./OrderController')
const SystemController = require('./SystemController')

router.use('/manager', AdminController)
router.use('/user', UserController);
router.use('/posts',PostsController)
router.use('/driver', DriverController)
router.use('/typecar', TypeCarController)
router.use('/pricetimeslot', PriceTimeSlotController)
router.use('/serviceattach', ServiceAttachController)
router.use('/notification', NotificationController)
router.use('/order', OrderController)
router.use('/system', SystemController)
router.use('/pricedistance', PriceDistanceController)

router.post('/login', jsonParser, (req, res, next) => {
  let { email, password } = req.body;
  models.User.findOne({
    where: { email, password: Encrypt.encrypt(password),status:1,type:0 },
    attributes: ['id', 'fullname', 'email', 'type','status']
  }).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'username or password wrong') //ERROR  
    let token = jwt.sign({
      id: data.id,
      type: data.type,
      email: 'admin@gmail.com'
    }, config.jwtKeyAdmin);
    let { id, fullname, email, type } = data
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', {
      id, fullname, email, type, token
    })
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

});

router.use('/changepass', (req, res, next) => AuthMiddeWare.verifyAdmin(req, res, next))
router.post('/changepass', jsonParser, (req, res, next) => {
  let { newPassword, oldPassword } = req.body
  const { id, fcmId, type, userType } = req.user;
  models.User.update(
    { password: Encrypt.encrypt(newPassword) },
    { where: { id, password: Encrypt.encrypt(oldPassword) } }
  ).then(data => {
    if (!data[0]) return cf.sendData(res, 'ERROR', 'change pass faild') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data[0]) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

module.exports = router;
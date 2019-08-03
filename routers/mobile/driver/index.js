const express = require('express');
const bodyParser = require('body-parser');
const config = require('../../../config');
const cf = require('../../../helpers/CF');
const cors = require('cors');
const AuthMiddeWare = require('../../AuthMiddeWare');
const router = express.Router();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const models = require('../../../models')
const Encrypt = require('../../../helpers/Encryption')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken')
var GeoPoint = require('geopoint');

//../routeName
router.use(cors());

router.post('/login', jsonParser, (req, res, next) => {
  const { username, password, fcmId } = req.body;
  console.log(req.body);
  models.Driver.find({
    where: {
      // [Op.or]: {
      phone: username,
      // email: username
      // },
      password: Encrypt.encrypt(password)
    },
    attributes: ['id', 'username', 'phone', 'fullname', 'avatar', 'type', 'numberCar', 'status', 'typeCarId','nameCar']
  }).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'username or password wrong') //ERROR  
    let token = jwt.sign({
      fcmId,
      id: data.id,
      type: data.type,
      userType: config.userType.driver,
      status: data.status
    }, config.jwtKeyMobile);
    let { id, username, fullname, avatar, email, type, numberCar, phone, typeCarId, status } = data
    models.FcmId.findOrCreate({
      where: { userId: id, fcmId },
      defaults: { userId: id, fcmId, type: config.userType.driver }
    }).spread((data, isCreate) => { })
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', {
      id, username, status,
      fullname, avatar,
      type, token, numberCar,
      phone, typeCarId
    })
  }).catch((err) => {
    console.log(err)
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

});

router.post('/signin', jsonParser, (req, res, next) => {
  const { phone, password, fullname, avatar, numberCar, typeCarId,nameCar } = req.body
  console.log(req.body,"body");
  if (!phone || !password || !fullname || !numberCar || !typeCarId || !nameCar) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
  models.Driver.findOrCreate({
    where: {
      phone
    },
    defaults: {
      // email,
      password: Encrypt.encrypt(password),
      phone,
      fullname,
      avatar,
      numberCar,
      status: 0,
      typeCarId,
      nameCar
    }
  }).spread((data, isCreate) => {
    if (!isCreate) return cf.sendData(res, 'ERROR', 'Số điện thoại đã tồn tại trong hệ thống') //ERROR  
    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    return cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

})

router.post('/near', jsonParser, (req, res, next) => {
  var { lat, log } = req.body
 
  models.Driver.findAll({
    where: {
      status: 1,
      // [Sequelize.literal]: Sequelize.literal(`dictanceKM( ${lat || 0}, ${long || 0}, latitude, longitude ) < 50 `)
    },
    attributes: ['id', 'username', 'phone', 'fullname', 'avatar', 'type', 'numberCar', 'status', 'latitude', 'longitude', 'typeCarId']
  }).then(data => {
    var dataFilter = [];
   if(data.length > 0){
     data.map((item,index) => {
       if(item.latitude !== null || item.longitude !== null){
        var point1 = new GeoPoint(lat, log)
        var point2 = new GeoPoint(item.latitude, item.longitude)
        var distance = point1.distanceTo(point2, true)
       if(distance < 6){
       dataFilter.push(item)
       }
       }
       return dataFilter;
     })
   }
  //  console.log(dataFilter,"data filter");
   return cf.sendData(res, 'SUCCESS', 'SUCCESS', dataFilter)

  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

router.post('/forgotpass', jsonParser, (req, res, next) => {
  const { phone } = req.body;
  if (!phone) cf.sendData(res, 'ERROR', 'Nhập số điện thoại')
  models.Driver.find({
    where: { phone },
    attributes: ['id', 'email', 'phone', 'avatar', 'fullname', 'numberCar']
  }).then(data => {
    if (!data) return cf.sendData(res, 'ERROR', 'Số điện thoại không tồn tại trong hệ thống') //ERROR  

    models.DriverRequestPass.findOrCreate(
      {
        where: {
          driverId: data.id
        },
        defaults: {
          driverId: data.id
        }
      })
    return cf.sendData(res, 'SUCCESS', 'Yêu cầu của bạn đã được gửi. Chúng tôi sẽ thông báo cho bạn khi được xử lý', data) //ERROR
  }).catch((err) => {
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });

})
// router.get('/info', jsonParser, (req, res, next) => {
//   const { id, fcmId, type, userType } = req.user;
//   models.Driver.find({
//     where: { id },
//     attributes: ['id', 'email', 'phone', 'avatar', 'fullname', 'numberCar']
//   }).then(data => {
//     if (!data) return cf.sendData(res, 'ERROR', 'user is not exist') //ERROR  
//     return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
//   }).catch((err) => {
//     cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
//   });

// })

// router.use('/logout', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
// router.post('/logout', jsonParser, (req, res, next) => {
//   const { id, fcmId, type, userType } = req.user;
//   models.FcmId.destroy({
//     userId: id,
//     fcmId,
//     type: userType
//   }).then(data => {
//     cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
//   }).catch((err) => {
//     cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
//   });
// })

// router.use('/updateinfo', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
// router.post('/updateinfo', jsonParser, (req, res, next) => {
//   const { email, phone, fullname, avatar, numberCar } = req.body
//   const { id, fcmId, type, userType } = req.user;
//   let objectUpdate = {}
//   if (!!email) objectUpdate.email = email;
//   if (!!phone) objectUpdate.phone = phone;
//   if (!!avatar) objectUpdate.avatar = avatar;
//   if (!!fullname) objectUpdate.fullname = fullname;
//   if (!!numberCar) objectUpdate.numberCar = numberCar;
//   models.Driver.update(
//     { ...objectUpdate },
//     { where: { id } }
//   ).then(data => {
//     cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
//   }).catch((err) => {
//     cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
//   });
// })

// router.use('/changepass', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
// router.post('/changepass', jsonParser, (req, res, next) => {
//   const { newPassword, oldPassword } = req.body
//   const { id, fcmId, type, userType } = req.user;
//   const inforTable = userType == config.userType.user ? models.User : models.Driver
//   inforTable.update(
//     { password: Encrypt.encrypt(newPassword) },
//     { where: { id, password: Encrypt.encrypt(oldPassword) } }
//   ).then(data => {
//     if (!data[0]) return cf.sendData(res, 'ERROR', 'change pass faild') //ERROR  
//     return cf.sendData(res, 'SUCCESS', 'SUCCESS', data[0]) //ERROR
//   }).catch((err) => {
//     cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
//   });
// })

module.exports = router;
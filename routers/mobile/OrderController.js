const express = require('express');
const bodyParser = require('body-parser');
const config = require('../../config');
const cf = require('../../helpers/CF');
const cors = require('cors');
const AuthMiddeWare = require('../AuthMiddeWare');
const router = express.Router();
const jsonParser = bodyParser.json();
const models = require('../../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash')
const socket = require('../socket')
const moment = require('moment')
var GeoPoint = require('geopoint');
// moment().format()
//../routeName
router.use(cors());
router.use('/', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));

const { getPrice } = require('../../helpers/CFPrice')

router.post('/getall', jsonParser, async (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { lat, long } = req.body;
  let typeCarId = (await models.Driver.findById(id)).typeCarId;

  // let sql = `SELECT * FROM Orders as od 
  //           WHERE od.status = 1 
  //           AND od.typeCarId = ${typeCarId}
  //           AND dictanceKM( ${lat || 0}, ${long || 0},od.fromLat, od.fromLog ) < 50 `
  models.Order.findAll({
    where: {
      status: 1,
      typeCarId,
      // [Sequelize.literal]: Sequelize.literal(`dictanceKM( ${lat || 0}, ${long || 0}, fromLat, fromLog ) < 50 `)
    },
    order: [['createdAt', 'DESC']],
    raw: true
  }).then(async data => {
	   console.log(data,"step1 order getAll");
    let arrSvA = await Promise.all([...data].map(async (v, k) => {
      v.serviceAttach = await models.ServiceAttachOrder.findAll({
        where: {
          orderId: v.id
        },
        raw: true
      })
      v.total = parseInt(v.price) + [...v.serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
      return v;
    }))
 console.log(arrSvA,"step2 arrSva ordergetAll");

    var dataFilter = [];
    if(arrSvA.length > 0){
      arrSvA.map((item,index) => {
        if(item.toLat !== null || item.toLog !== null){
         var point1 = new GeoPoint(lat, long)
         var point2 = new GeoPoint(item.toLat, item.toLog)
         var distance = point1.distanceTo(point2, true)
        if(distance < 6){
        dataFilter.push(item)
        }
        }
        return dataFilter;
      })

    }
	   console.log(dataFilter,"step3 datafilter order getAll");

    cf.sendData(res, 'SUCCESS', 'SUCCESS', dataFilter) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});

router.post('/create', jsonParser, async (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  const {
    typeCarId, fromLocation,
    toLocation, description,
    long, fromLat, fromLog,
    toLat, toLog,
    serviceAttach, duration,infoPrice } = req.body
  if (userType != config.userType.user) return cf.sendData(res, 'ERROR', 'Lái xe không tạo được đơn hàng');
  if (
    !typeCarId
    || !fromLocation
    || !toLocation
    || !long
    || !fromLat
    || !fromLog
    || !toLat
    || !toLog
  ) return cf.sendData(res, 'ERROR', 'Điền đầy đủ thông tin');
   
  var price = 1
    if(infoPrice.length > 0 && typeCarId){
      infoPrice.map((item,index) => {
        if(item.typeCarId == typeCarId){
          price=item.price
        }
      })
    }
    console.log(price,"price hihi");
  // let price = 1

  // try {
  //   price = await getPrice({ typeCarId, long })

  // } catch (err) {
  //   cf.wirtelog(err, module.filename)
  //   cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  // }

  models.Order.create({
    typeCarId,
    fromLocation,
    toLocation,
    description,
    long,
    fromLat,
    fromLog,
    toLat,
    toLog,
    duration,
    userId: id,
    status: 1,
    price: price,
    driverId:0
  }).then(async data => {  
    let arrSvA = await Promise.all([...serviceAttach].map((v, k) => models.ServiceAttachOrder.create({
      serviceAttachId: v.id,
      orderId: data.id,
      amount: v.amount || 1,
      price: v.price,
      name: v.name
    })))
    let dataSend = data.toJSON();
    console.log(data,"data send");
    dataSend.total = parseInt(dataSend.price) + [...arrSvA].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
    socket.pushOrderToDriver({ ...dataSend, serviceAttach: JSON.stringify(arrSvA) })
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
})

router.post('/history', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { page } = req.body;
  page = page || 1;
  page = page - 1;
  let sql = `SELECT od.*, tc.name AS nameTypeCar, dr.numberCar FROM Orders AS od
            INNER JOIN TypeCars AS tc ON  tc.id = od.typeCarId `

  if (userType == config.userType.user) {
    sql += `LEFT OUTER JOIN OrderOfDrivers AS odod ON odod.orderId = od.id
            LEFT OUTER JOIN Drivers AS dr ON odod.driverId = dr.id 
            WHERE od.userId = ${id} `
  } else {
    sql += `INNER JOIN OrderOfDrivers AS odod ON odod.orderId = od.id
            INNER JOIN Users AS us ON us.id =  od.userId 
            INNER JOIN Drivers AS dr ON odod.driverId = dr.id 
            WHERE odod.driverId = ${id} `
  }

  sql += `AND odod.status = 1 ORDER BY od.id DESC LIMIT ${config.pageLimit} OFFSET ${page * config.pageLimit} `
  models.sequelize.query(
    sql,
    { replacements: [], type: models.sequelize.QueryTypes.SELECT }
  ).then(async data => {
    let dataOSA = await Promise.all([...data].map(async (v, k) => {
      v.serviceAttach = await models.ServiceAttachOrder.findAll({
        where: {
          orderId: v.id
        },
        raw: true
      })
      v.total = parseInt(v.price) + [...v.serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
      return v;
    }))
    cf.sendData(res, 'SUCCESS', 'SUCCESS', dataOSA)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

})

router.post('/getorder', jsonParser, async (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId } = req.body;

  let oddF = await models.Order.findById(orderId)
  if (!oddF || oddF.status != 1) return cf.sendData(res, 'ERROR', 'Đơn hàng không tồn tại');
  if (userType != config.userType.driver) return cf.sendData(res, 'ERROR', 'User không nhận được đơn hàng');
  models.OrderOfDriver.findOrCreate({
    where: { orderId, status: 0 },
    defaults: {
      orderId,
      driverId: id,
      status: 0,
      rate: 0
    }
  }).spread(async (data, isCreate) => {
    if (!isCreate) return cf.sendData(res, 'ERROR', 'Đơn hàng đã được nhận bởi một lái xe khác')
    let inforDriver = await models.Driver.find({
      where: {
        id: id
      },
      attributes: ['id', 'username', 'phone', 'fullname', 'avatar', 'type', 'numberCar', 'status', 'latitude', 'longitude', 'typeCarId', 'rate','nameCar'],
      raw: true
    })

    models.Order.findById(orderId).then(async data => {
      data.update({ status: 2 })
      // data = data.toJSON()
      let serviceAttach = await models.ServiceAttachOrder.findAll({
        where: {
          orderId: data.id
        },
        raw: true
      })

      socket.pushOrderAcceptedToUser({ ...data.toJSON(), serviceAttach, inforDriver }, 'acceptedorder', `Đơn hàng của bạn đã được nhận!`)
    })
    socket.pushAllDriverOnline({ id: orderId, orderId }, 'delorder')

    return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

router.post('/rate', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId, rate, driverId } = req.body;
  if (userType != config.userType.user) return cf.sendData(res, 'ERROR', 'lái xe không được đánh giá đơn hàng');
  models.OrderOfDriver.update(
    { rate },
    { where: { orderId } }
  ).then(async data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    let orderVote = await models.OrderOfDriver.find({ where: { orderId } })
    if (!!orderVote) {
      let dataRate = await models.OrderOfDriver.findAll({
        where: { driverId: orderVote.driverId },
        attributes: ['rate'],
        raw: true
      })
      let sumRate = _.sumBy(dataRate, 'rate');
      let totalRate = dataRate.length || 1;
      models.Driver.update(
        {
          rate: _.ceil(sumRate / totalRate, 2)
        },
        { where: { id: orderVote.driverId } })
        .then(data => {

          socket.pushVoteToDriver({ orderId, driverId, rate })
          // push notify to all driver
        })
    }
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

})

router.post('/delete', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId } = req.body;
  if (userType != config.userType.user) return cf.sendData(res, 'ERROR', 'Lái xe không được xóa đơn hàng');

  models.Order.update(
    { status: 3 },
    { where: { id: orderId, userId: id, status: 1 } }
  ).then(data => {
    models.OrderOfDriver.find({
      where: {
        orderId,
        status: 0,
      }
    }).then(data => {
      if (!!data && !!data.driverId) {
        models.OrderOfDriver.update(
          { status: 3, endTime: moment().format('YYYY-MM-DD') },
          { where: { id: data.id } })
        socket.pushOneDriver({ id: orderId, orderId, driverId: data.driverId, title: "Thông báo", body: "Người dùng đã hủy đơn hàng của bạn" }, 'delorderbyuser')
      }
    })
    //hoanabc
    socket.pushAllDriverOnline({ id: orderId, orderId }, 'delorder')
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

})
router.post('/cancel', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId, rate, driverId } = req.body;
  if (userType != config.userType.driver) return cf.sendData(res, 'ERROR', 'User không được kêt thúc đơn hàng');
  models.OrderOfDriver.update(
    { status: 3, endTime: moment().format('YYYY-MM-DD') },
    { where: { orderId, driverId: id } }
  ).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    models.Order.findById(orderId).then(async data => {
      data.update({ status: 3 })
      data = data.toJSON()
      let serviceAttach = await models.ServiceAttachOrder.findAll({
        where: {
          orderId: data.id
        },
        raw: true
      })
      data.total = parseInt(data.price) + [...serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
      socket.pushOrderAcceptedToUser(data, 'cancelorder', `Lái xe đã hủy đơn hàng của bạn !`)
      socket.pushOrderToDriver({ ...data, serviceAttach: JSON.stringify(serviceAttach) })
    })

  }).catch(err => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

})
router.post('/finish', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId, rate, driverId } = req.body;
  if (userType != config.userType.driver) return cf.sendData(res, 'ERROR', 'User không được kêt thúc đơn hàng');
  models.OrderOfDriver.update(
    { status: 1, endTime: moment().format('YYYY-MM-DD') },
    { where: { orderId } }
  ).then(data => {
    models.Order.findById(orderId).then(async data => {
      data.update({ status: 4 })
      socket.pushOrderAcceptedToUser(data.toJSON(), 'finishorder', `Đơn hàng của bạn đã hoàn thành !`)
    })
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

})

router.post('/gocar', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId, rate, driverId } = req.body;
  if (userType != config.userType.driver) return cf.sendData(res, 'ERROR', 'User không được kêt thúc đơn hàng');
  models.OrderOfDriver.update(
    { status: 0, endTime: moment().format('YYYY-MM-DD') },
    { where: { orderId } }
  ).then(data => {
    models.Order.findById(orderId).then(async data => {
      data.update({ status: 5 })
      socket.pushOrderGoCarToUser(data.toJSON(), 'gocar', `Bạn đã lên xe, không được phép hủy chuyến !`)
    })
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch(err => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

})

router.post('/info', jsonParser, (req, res, next) => {
  const { id, fcmId, type, userType } = req.user;
  let { orderId } = req.body;

  models.Order.findById(orderId).then(async data => {
    if (!data) cf.sendData(res, 'ERROR', 'not found', data)
    data = data.toJSON()
    let serviceAttach = await models.ServiceAttachOrder.findAll({
      where: {
        orderId: data.id
      },
      raw: true
    })
    let orderDr = await models.OrderOfDriver.find({
      where: {
        orderId: data.id,
        status: { [Op.in]: [0, 1] }
      }
    })
    if (!!orderDr && orderDr.driverId) {
      let inforDriver = await models.Driver.find({
        where: {
          id: orderDr.driverId
        },
        attributes: ['id', 'username', 'phone', 'fullname', 'avatar', 'type', 'numberCar', 'status', 'latitude', 'longitude', 'typeCarId', 'rate','nameCar'],
        raw: true
      })
      data.inforDriver = inforDriver
    }

    data.serviceAttach = serviceAttach
    data.total = parseInt(data.price) + [...serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)

  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });


})



setTimeout(async () => {
  // let oddF = await models.Order.findById(1000)
  // if (!oddF) console.log('aaaaaaaaaaaa')
  // let inforDriver = await models.Driver.find({
  //   where: {
  //     id: 2
  //   },
  //   attributes: ['id', 'username', 'phone', 'fullname', 'avatar', 'type', 'numberCar', 'status', 'latitude', 'longitude', 'typeCarId'],
  //   raw: true
  // })

  // models.Order.findAll({
  //   where: {
  //     // status: 1,
  //     id : 1
  //     // typeCarId,
  //     // [Sequelize.literal]: Sequelize.literal(`dictanceKM( ${lat || 0}, ${long || 0}, fromLat, fromLog ) < 50 `)
  //   },
  //   order: [['createdAt', 'DESC']],
  //   raw: true
  // }).then(async data => {
  //   let arrSvA = await Promise.all([...data].map(async (v, k) => {
  //     v.serviceAttach = await models.ServiceAttachOrder.findAll({
  //       where: {
  //         orderId: v.id
  //       },
  //       raw: true
  //     })
  //     v.total = parseInt(v.price) + [...v.serviceAttach].reduce((pV, cV) => pV + parseInt(cV.price || 0), 0);
  //     return v;
  //   }))
  //   console.log('--------------------')
  //   console.log(arrSvA)
  // }).catch((err) => {
  //   console.log(err)
  // });
}, 3000);

module.exports = router;

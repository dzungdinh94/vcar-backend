const AuthMiddeWare = require('./AuthMiddeWare')
const config = require('../config')
const cf = require('../helpers/CF')
const cfNoty = require('../helpers/CFNoty')
const _ = require('lodash')
const models = require('../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const driverOnline = {}
const userOnline = {}
var GeoPoint = require('geopoint');

let ioThis

module.exports.config = (io) => {
  ioThis = io
  io.of('/mobile').use((socket, next) => {
    console.log("socket da nhan duoc")
    let { token, fcmId } = socket.handshake.query
    AuthMiddeWare.verifyMobileSocket(token, (err, data) => {
      if (err) return next(err);
      socket.user = { ...data, fcmId }
      next();
    })
  });
  io.of('/mobile').on('connection', (socket) => {
    console.log('socket connection hii', socket.user)
    let { token, fcmId } = socket.handshake.query

    if (socket.user.userType == config.userType.user) {
      userOnline[fcmId] = socket.id;
      setTimeout(() => {
        console.log('------------user', userOnline)
      }, 3000);
      socket.join('roomuser', () => { })

    };
    if (socket.user.userType == config.userType.driver) {
      driverOnline[fcmId] = socket.id
      console.log('driver', driverOnline)
      socket.join('roomdriver', () => { })

    };
    // console.log(driverOnline, userOnline)

    socket.emit('test', { a: 'motconvit' })
    socket.on('test', (data) => {
      console.log('dkmmmdkdm')
      socket.emit('test', { a: 'motconvit' })
    })
    socket.on('disconnect', (data) => {
      console.log('disconnect', socket.user)
      if (socket.user.userType == config.userType.user) delete userOnline[socket.user.fcmId];
      if (socket.user.userType == config.userType.driver) delete driverOnline[socket.user.fcmId];
      // console.log(driverOnline, userOnline)

    })
  });

  io.of('/admin').use((socket, next) => {
    let { token } = socket.handshake.query
    AuthMiddeWare.verifyAdminSocket(token, (err, data) => {
      if (err) return next(err);
      socket.user = { ...data }
      next();
    })
  });
  io.of('/admin').on('connection', (socket) => {
    socket.join('roomadmin', () => {
      // io.to('room 237').emit('a new user has joined the room'); // broadcast to everyone in the room
    });
    socket.on('disconnectadmin', (data) => {
      // console.log('disconnect', socket.user)
    })
  });
}
module.exports.pushOrderToDriver = (dataSend) => {
  console.log(dataSend.fromLat,"data send");
  models.Driver.findAll({
    where: {
      status: 1,
      isOnline:1,
      typeCarId:dataSend.typeCarId
      // [Sequelize.literal]: Sequelize.literal(`dictanceKM( ${lat || 0}, ${long || 0}, fromLat, fromLog ) < 50 `)
    },
    order: [['createdAt', 'DESC']],
    raw: true
  }).then(data1 => {
    models.FcmId.findAll({
      where: {
        type:config.userType.driver
        // [Sequelize.literal]: Sequelize.literal(`dictanceKM( ${lat || 0}, ${long || 0}, fromLat, fromLog ) < 50 `)
      },
      order: [['createdAt', 'DESC']],
      raw: true
    }).then(data2 => 
      {
        var dataFilter = [];
        if(data1.length > 0){
          data1.map((item,index) => {
            if(item.latitude !== null || item.longitude !== null){
              var point1 = new GeoPoint(dataSend.fromLat, dataSend.fromLog)
              var point2 = new GeoPoint(item.latitude, item.longitude)
              var distance = point1.distanceTo(point2, true)
             if(distance < 6){
             dataFilter.push(item)
             }
             }
             return dataFilter;
          })
        }
        if(dataFilter.length > 0){
          // console.log(dataFilter,"hihi");
          var fcmIds = []
          dataFilter.map((item2,index) => {

            // if(dataFilter.id == data2.userId){
              // console.log(data2)
             
              data2.map(v => {
                if(item2.id == v.userId){
                   console.log(driverOnline,"id hihi")
                  if (!!driverOnline[v.fcmId]) {
                   console.log("Da vao day");
                   console.log(driverOnline[v.fcmId]);
                   

                    // ioThis.of('/mobile').to(driverOnline[v.fcmId]).emit('neworder', dataSend);
                  }else fcmIds.push(v.fcmId)
                }
                })
               
            // }
          })
          // console.log(fcmIds,"fcmId");
          // if (!!fcmIds.length) cfNoty.pushNotiWithFcmId({
          //   fcmIds,
          //   data: { ...dataSend, typeNoti: 'neworder' },
          //   title: 'Thông báo',
          //   body: 'Có một đơn hàng mới ở gần vị trí của bạn',
          // }, (err, data) => {
          //   if (err) cf.wirtelog(err, module.filename)
          // })
        }
    }
      ).catch(err =>console.log(err))
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });

  // models.sequelize.query(
  //   `SELECT fcm.fcmId FROM FcmIds AS fcm 
  //   INNER JOIN Drivers AS dr ON fcm.userId = dr.id 
  //   WHERE fcm.type = ${config.userType.driver} 
  //   AND dr.typeCarId = ${dataSend.typeCarId}
  //   AND dr.isOnline = 1 
  //   AND dictanceKM( ${dataSend.fromLat || 0}, ${dataSend.fromLog || 0}, dr.latitude, dr.longitude ) < 50 `,
  //   { replacements: [], type: models.sequelize.QueryTypes.SELECT }
  // ).then(data => {
  //   let fcmIds = []
  //   data.map(v => {
  //     if (!!driverOnline[v.fcmId]) {
  //       ioThis.of('/mobile').to(driverOnline[v.fcmId]).emit('neworder', dataSend);
  //     }
  //     else fcmIds.push(v.fcmId)
  //   })
  //   if (!!fcmIds.length) cfNoty.pushNotiWithFcmId({
  //     fcmIds,
  //     data: { ...dataSend, typeNoti: 'neworder' },
  //     title: 'Thông báo',
  //     body: 'Có một đơn hàng mới ở gần vị trí của bạn',
  //   }, (err, data) => {
  //     if (err) cf.wirtelog(err, module.filename)
  //   })
  // }).catch((err) => {
  //   cf.wirtelog(err, module.filename)
  //   cf.sendData(res, 'ERROR', 'ERROR', err)
  // });
}

module.exports.pushVoteToDriver = (dataSend) => {
  models.FcmId.findAll({
    where: {
      userId: dataSend.driverId,
      type: config.userType.drive
    },
    attributes: ['fcmId']
  }).then(data => {
    let fcmIds = []
    data.map(v => {
      if (!!driverOnline[v.fcmId]) return ioThis.of('/mobile').to(driverOnline[v.fcmId]).emit('newvote', dataSend);
      fcmIds.push(v.fcmId)
    })
    if (!!fcmIds.length) cfNoty.pushNotiWithFcmId({
      fcmIds,
      data: { ...dataSend, typeNoti: 'newvote' },
      title: 'Thông báo',
      body: `Chuyến hàng của bạn đã được đánh giá ${dataSend.rate} sao!`,
    }, (err, data) => {
      if (err) cf.wirtelog(err, module.filename)
    })
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
}

module.exports.pushAllDriverOnline = (dataSend, event) => {
  ioThis.of('/mobile').to('roomdriver').emit(event, dataSend);
}
module.exports.pushAllUserOnline = (dataSend, event) => {
  ioThis.of('/mobile').to('roomuser').emit(event, dataSend);
}

module.exports.pushOneDriver = (dataSend, event) => {
  models.sequelize.query(
    `SELECT fcm.fcmId FROM FcmIds AS fcm 
    INNER JOIN Drivers AS dr ON fcm.userId = dr.id 
    WHERE fcm.type = ${config.userType.driver} 
    AND dr.id = ${dataSend.driverId}`,
    { replacements: [], type: models.sequelize.QueryTypes.SELECT }
  ).then(data => {
    let fcmIds = []
    data.map(v => {
      console.log('driver-----------fcm', v)
      if (!!driverOnline[v.fcmId]) ioThis.of('/mobile').to(driverOnline[v.fcmId]).emit(event, dataSend);
      fcmIds.push(v.fcmId)
    })
    if (!!fcmIds.length) cfNoty.pushNotiWithFcmId({
      fcmIds,
      data: { ...dataSend, typeNoti: event },
      title: 'Thông báo',
      body: dataSend.body
    }, (err, data) => {
      console.log(err)
      if (err) cf.wirtelog(err, module.filename)
    })
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
  });
}

module.exports.pushOrderAcceptedToUser = (dataSend, event, body) => {
  models.FcmId.findAll({
    where: {
      userId: dataSend.userId,
      type: config.userType.user
    },
    attributes: ['fcmId'],
    raw: true
  }).then(data => {
    // console.log(event)
    // console.log(dataSend)
    let fcmIds = []
    ioThis.of('/mobile').to('roomuser').emit(event, dataSend);
    data.map(v => {
      console.log('user-----------fcm', v)
      if (!!userOnline[v.fcmId]) return ioThis.of('/mobile').to(userOnline[v.fcmId]).emit(event, dataSend);
      fcmIds.push(v.fcmId)
    })
    if (!!fcmIds.length) cfNoty.pushNotiWithFcmId({
      fcmIds,
      data: { ...dataSend, typeNoti: event },
      title: 'Thông báo',
      body,
    }, (err, data) => {
      if (err) cf.wirtelog(err, module.filename)
    })
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
}
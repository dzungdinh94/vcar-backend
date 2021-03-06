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

router.use('/', (req, res, next) => {
    AuthMiddeWare.verifyAdmin(req, res, next);
});


router.post('/getall', jsonParser, (req, res, next) => {
    let { page, search, status, typeCarId } = req.body;
    page = page || 1;
    page = page - 1
    search = search || '';
    let objWhere = {}
    if (!!typeCarId) objWhere.typeCarId = typeCarId;
    if (status == "0" || status == "1") objWhere.status = status;

    models.Driver.findAndCountAll({
        where: {
            // status: 1,
            ...objWhere,
            [Op.or]: {
                // email: { [Op.like]: `%${search}%` },
                phone: { [Op.like]: `%${search}%` },
                fullname: { [Op.like]: `%${search}%` },
            }
        },
        offset: page * config.pageLimit,
        limit: config.pageLimit,
        attributes: ['id', 'phone', 'avatar', 'fullname', 'numberCar', 'typeCarId', 'status','nameCar'],
        order: [['id', 'DESC']],
    }).then(data => {
        let { count, rows } = data
        cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
});
router.post('/create', jsonParser, (req, res, next) => {
    let { nameCar, phone, password, fullname, avatar, numberCar, typeCarId } = req.body
    if (!phone || !password || !fullname || !numberCar || !typeCarId) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
    models.Driver.findOrCreate({
        where: {
            email
        },
        defaults: {
            nameCar,
            password: Encrypt.encrypt(password),
            phone,
            fullname,
            avatar,
            status: 1,
            numberCar,
            typeCarId
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
    models.Driver.find({
        where: { id: 1 },
        attributes: ['id', 'phone', 'avatar', 'fullname']
    }).then(data => {
        if (!data) return cf.sendData(res, 'ERROR', 'Driver is not exist') //ERROR  
        return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
})
router.post('/update', jsonParser, (req, res, next) => {
    let { id, nameCar, phone, password, fullname, avatar, numberCar, typeCarId, status } = req.body;
    console.log(req.body,"driver")
    let objectUpdate = {}
    if (!!nameCar) objectUpdate.nameCar = nameCar;
    if (!!phone) objectUpdate.phone = phone;
    if (!!fullname) objectUpdate.fullname = fullname;
    if (!!avatar) objectUpdate.avatar = avatar;
    if (!!password) objectUpdate.password = Encrypt.encrypt(password);
    if (!!numberCar) objectUpdate.numberCar = numberCar;
    if (!!typeCarId) objectUpdate.typeCarId = typeCarId;
    if (!!status || status == 0) objectUpdate.status = status;
    models.Driver.update(
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
    let { id } = req.body
    if (!id) return cf.sendData(res, 'ERROR', 'ERROR');
    if (typeof (id) == 'object' && id.length > 0) {
        models.Driver.destroy({
            where: { id },
        }).then(data => {
            cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
        }).catch((err) => {
            cf.wirtelog(err, module.filename)
            cf.sendData(res, 'ERROR', 'ERROR', err)
        });
    } else {
        models.Driver.findById(id).then(data => {
            if (!data) return cf.sendData(res, 'ERROR', 'PriceTimeSlot is not exist')
            data.destroy();
            return cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
        }).catch((err) => {
            cf.wirtelog(err, module.filename)
            cf.sendData(res, 'ERROR', 'ERROR', err)
        });
    }
})

router.post('/orderlist', jsonParser, (req, res, next) => {


    let { startDate, endDate } = req.body

    let sql = `SELECT od.*, odod.driverId, odod.status sttOdod, dr.phone, dr.fullname, dr.numberCar
    FROM OrderOfDrivers odod
    INNER JOIN Orders od ON odod.orderId = od.id 
    INNER JOIN Drivers dr ON dr.id = odod.driverId
    WHERE od.timeStart  > '${startDate}'
    And od.timeStart <  '${endDate}'`
    models.sequelize.query(sql,
        {
            replacements: [],
            type: models.sequelize.QueryTypes.SELECT
        }
    ).then(async data => {
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
        cf.sendData(res, 'SUCCESS', 'SUCCESS', arrSvA)
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err)
    });
})
router.get('/requestpass', (req, res, next) => {
    let sql = `SELECT dr.phone, dr.fullname, dr.numberCar, drp.id, drp.createdAt, drp.driverId
        FROM DriverRequestPasses  drp
        INNER JOIN Drivers dr on dr.id = drp.driverId `
    models.sequelize.query(sql,
        {
            replacements: [],
            type: models.sequelize.QueryTypes.SELECT
        }
    ).then(data => {
        cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: 1, rows: data })
    }).catch((err) => {
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err)
    });
})
router.post('/delrequestpass', jsonParser, (req, res, next) => {
    let { id } = req.body
    models.DriverRequestPass.destroy({
        where: { id },
    }).then(data => {
        cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err)
    });
})


module.exports = router;
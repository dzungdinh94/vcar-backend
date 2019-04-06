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
    let { page, search } = req.body;
    page = page || 1;
    page = page - 1
    search = search || '';
    models.User.findAndCountAll({
        where: {
            // status: 1,
            [Op.or]: {
                email: { [Op.like]: `%${search}%` },
                phone: { [Op.like]: `%${search}%` },
                fullname: { [Op.like]: `%${search}%` },
            }
        },
        offset: page * config.pageLimit,
        limit: config.pageLimit,
        attributes: ['id', 'email', 'phone', 'avatar', 'fullname'],
        order: [['id', 'DESC']]
    }).then(data => {
        let { count, rows } = data
        cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
});
router.post('/create', jsonParser, (req, res, next) => {
    let { email, phone, password, fullname, avatar } = req.body
    if (!fullname || !phone || !password || !email) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
    models.User.findOrCreate({
        where: {
            [Op.or]: { email, phone }
        },
        defaults: {
            email,
            password: Encrypt.encrypt(password),
            phone,
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
    let { id } = req.body
    models.User.find({
        where: { id },
        attributes: ['id', 'email', 'phone', 'avatar', 'fullname']
    }).then(data => {
        if (!data) return cf.sendData(res, 'ERROR', 'user is not exist') //ERROR  
        return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
})
router.post('/update', jsonParser, (req, res, next) => {
    let { id, email, phone, fullname, avatar, password } = req.body
    let objectUpdate = {}
    if (!!email) objectUpdate.email = email;
    if (!!phone) objectUpdate.email = phone;
    if (!!fullname) objectUpdate.email = fullname;
    if (!!avatar) objectUpdate.email = avatar;
    if (!!password) objectUpdate.password = Encrypt.encrypt(password)
    models.User.update(
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
        models.User.destroy({
            where: { id },
        }).then(data => {
            cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
        }).catch((err) => {
            cf.wirtelog(err, module.filename)
            cf.sendData(res, 'ERROR', 'ERROR', err)
        });
    } else {
        models.User.findById(id).then(data => {
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
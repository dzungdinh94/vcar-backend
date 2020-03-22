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
    models.Posts.findAndCountAll({
        where: {
            // status: 1,
            [Op.or]: {
                title: { [Op.like]: `%${search}%` },
                address: { [Op.like]: `%${search}%` },
                area: { [Op.like]: `%${search}%` },
            },
            
        },
        include: 'User',
        offset: page * config.pageLimit,
        limit: config.pageLimit,
        attributes: ['id', 'money', 'commission', 'address', 'title','area','pictures','description','type','status','direction','phone','nameSeller','sales'],
        order: [['id', 'DESC']]
    }).then(data => {
        let { count, rows } = data
        console.log(rows,"rows");
        cf.sendData(res, 'SUCCESS', 'SUCCESS', { totalPage: Math.ceil(count / config.pageLimit), rows }) //ERROR
    }).catch((err) => {
        console.log(err,"err");
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
});
router.post('/create', jsonParser, (req, res, next) => {
    let { id, type,money,commission,address,title,area,sales,pictures,description,direction,phone,nameSeller,status,UserId } = req.body;
    if (!type || !money || !commission || !address || !title || !area || !sales || !pictures || !description || !direction || !nameSeller) return cf.sendData(res, 'ERROR', 'Nhập đầy đủ thông tin');
    models.Posts.create({
        type,money,commission,address,title,area,sales,pictures,description,direction,phone,nameSeller,UserId
    }).then((data) => {

        // if (!isCreate) return cf.sendData(res, 'ERROR', 'data is exist') //ERROR  
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
        attributes: ['id', 'email', 'phone', 'fullname']
    }).then(data => {
        if (!data) return cf.sendData(res, 'ERROR', 'user is not exist') //ERROR  
        return cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
    }).catch((err) => {
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
})
router.post('/update', jsonParser, (req, res, next) => {
    let { id, type,money,commission,address,title,area,sales,pictures,description,direction,phone,nameSeller,status } = req.body;
    console.log(pictures,"pictures");
    let objectUpdate = {}
    if (!!phone) objectUpdate.phone = phone;
    if (type !== null || type !== undefined) objectUpdate.type = type;
    if (!!money) objectUpdate.money = money;
    if (!!commission) objectUpdate.commission = commission;
    if (!!address) objectUpdate.address = address;
    if (!!title) objectUpdate.title = title;
    if (!!sales) objectUpdate.sales = sales;
    if (!!area) objectUpdate.area = area;
    if (!!pictures) objectUpdate.pictures = pictures;
    if (!!description) objectUpdate.description = description;
    if (!!direction) objectUpdate.direction = direction;
    if (!!nameSeller) objectUpdate.nameSeller = nameSeller;
    if (status !== null || status !== undefined) objectUpdate.status = status;
    
    // if (!!password) objectUpdate.password = Encrypt.encrypt(password)
    models.Posts.update(
        { ...objectUpdate },
        { where: { id } }
    ).then(data => {
        // console.log(data,"err");
        cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
    }).catch((err) => {
        // console.log(err,"err");
        cf.wirtelog(err, module.filename)
        cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
    });
})
router.post('/delete', jsonParser, (req, res, next) => {
    let { id } = req.body
    if (!id) return cf.sendData(res, 'ERROR', 'ERROR');
        models.Posts.destroy({
            where: { id },
        }).then(data => {
            cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
        }).catch((err) => {
            cf.wirtelog(err, module.filename)
            cf.sendData(res, 'ERROR', 'ERROR', err)
        });
   
})



module.exports = router;
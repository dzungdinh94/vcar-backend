const express = require('express');
const bodyParser = require('body-parser');
const cf = require('../../helpers/CF');
const cors = require('cors');
const AuthMiddeWare = require('../AuthMiddeWare');
const router = express.Router();
const jsonParser = bodyParser.json();
const models = require('../../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//../routeName
router.use(cors());
// router.use('/', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.post('/getall', jsonParser, (req, res, next) => {
  let { typeCarId, time } = req.body
  let objectWhere = {};
  if (!!typeCarId) objectWhere.typeCarId = typeCarId
  if (!!time){
    objectWhere.startTime = { [Op.lte] : time +':00'}
    objectWhere.endTime = { [Op.gte] : time +':00' }
  } 
  models.PriceTimeSlot.findAll({
    where: {
      ...objectWhere
    }
  }).then(data => {
    // console.log(data)
    cf.sendData(res, 'SUCCESS', 'SUCCESS', !!time ? data[0] : data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

module.exports = router;
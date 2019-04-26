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
  let { typeCarId, time,distance } = req.body;
  console.log(req.body,"body hihi");
  let objectWhere = {};
  var converKm = !!distance ? distance/1000 :0
  if (!!typeCarId) objectWhere.typeCarId = typeCarId
  // if (!!time){
  //   objectWhere.startTime = { [Op.lte] : time +':00'}
  //   objectWhere.endTime = { [Op.gte] : time +':00' }
  // } 
  models.PriceTimeSlot.findAll({
    where: {
      ...objectWhere
    }
  }).then(data => {
    if(data.length > 0){
      data.map((item,index) => {
        if(item.startTime <= time && item.endTime >= time){
          item.price = Math.round(item.price * converKm/1000)*1000
        }else{
          item.price = Math.round(8000 * converKm/1000)*1000
        }
         
        //  console.log(," item.price hihi");
      })
      return data
    }
    
  }).then((dataNew)=>{
    if(dataNew.length > 0){
      cf.sendData(res, 'SUCCESS', 'SUCCESS', !!time ? dataNew[0] : dataNew)
    }
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

module.exports = router;
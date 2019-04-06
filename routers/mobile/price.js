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

const { getPrice } = require('../../helpers/CFPrice')

//../routeName
router.use(cors());
// router.use('/', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));
router.post('/getprice', jsonParser, async (req, res, next) => {
  let { typeCarId, long } = req.body
  try {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', { price: await getPrice({ typeCarId, long }) })
  } catch (error) {
    cf.sendData(res, 'ERROR', 'ERROR', error)
  }

})

router.post('/getpricedistance', jsonParser, (req, res, next) => {
  let { priceTimeSlotId } = req.body;
  let objectWhere = {}
  if (!!priceTimeSlotId) objectWhere.priceTimeSlotId = priceTimeSlotId
  models.PriceDistance.findAll({
    where: {
      ...objectWhere,
    },
    order: [['endDistance', 'ASC']],
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.sendData(res, 'ERROR', 'ERROR', err) //ERROR
  });
});


module.exports = router;
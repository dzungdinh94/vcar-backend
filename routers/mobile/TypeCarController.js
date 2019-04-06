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
router.get('/getall', jsonParser, (req, res, next) => {
  models.TypeCar.findAll({

  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
})

module.exports = router;
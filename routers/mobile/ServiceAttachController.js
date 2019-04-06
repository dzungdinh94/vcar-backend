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
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//../routeName
router.use(cors());
// router.use('/', (req, res, next) => AuthMiddeWare.verifyMobile(req, res, next));

router.post('/getall', jsonParser, (req, res, next) => {
  let { typeCarId } = req.body;
  let objectWhere = {}
  if (!!typeCarId) objectWhere.typeCarId = typeCarId
  models.ServiceAttach.findAll({
    where: {
      ...objectWhere,
    }
  }).then(data => {
    cf.sendData(res, 'SUCCESS', 'SUCCESS', data) //ERROR
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});

module.exports = router;
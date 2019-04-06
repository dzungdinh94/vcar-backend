const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthMiddeWare = require('../AuthMiddeWare');
const router = express.Router();
const jsonParser = bodyParser.json();
const fs = require('fs')
const path = require('path');
const cf = require('../../helpers/CF');

//../routeName
router.use(cors());
router.use('/', (req, res, next) => AuthMiddeWare.verifyAdmin(req, res, next));


router.post('/update', jsonParser, (req, res, next) => {
  let { hotline, linkGuide, linkTermOfService } = req.body;
  let text = {
    hotline,
    linkGuide,
    linkTermOfService
  }
  fs.writeFile(
    path.join(__dirname, `../../infoapp.json`),
    JSON.stringify(text),
    (err, data) => {
      cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
    })
});
router.get('/getinfo', (req, res, next) => {
  let data = require('../../infoapp.json')
  cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
});

module.exports = router;
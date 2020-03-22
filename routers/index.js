const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const config = require('../config');
const responseCode = require('../ResponseCode');
const cf = require('../helpers/CF');
const cors = require('cors');
const models = require('../models');
const AuthMiddeWare = require('./AuthMiddeWare');
const Encryption = require('../helpers/Encryption');
const multer = require('multer')
const fs = require('fs');
const path = require('path');
const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });


router.use(cors());
router.get('/', (req, res, next) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Continues Or Halt</title>
  </head>
  <body>
    <h1 style="color:red;text-align:center;padding-top:30px">
      Created by 
      <a href="mailto://continuesorhalt@gmail.com">Continues Or Halt</a>
    </h1>
    <h3 style="text-align:center;padding-top:30px">Ok :))</h3>
  </body>
  </html>`)
});

const admin = require('./admin/')
router.use('/admin', admin)

const mobile = require('./mobile/')
router.use('/mobile', mobile)

let storageMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.png')
  }
});
let upload = multer({ storage: storageMulter }).array('files', 6);
// router.use('/admin/fileupload', (req, res, next) => AuthMiddeWare.verifyAdmin(req, res, next));
router.post('/admin/fileupload', (req, res, next) => {
  upload(req, res, (err) => {
    console.log( req.files,"hiih");
    let arrImg = [];
    if(req.files.length >0){
      req.files.map((item,index)=>{
        arrImg.push(item.filename)
      })
    }
    if (!err) return cf.sendData(res, 'SUCCESS', 'SUCCESS', JSON.stringify(arrImg))
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});
router.post('/mobile/fileupload', (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return cf.sendData(res, 'SUCCESS', 'SUCCESS', req.files[0].filename)
    cf.wirtelog(err, module.filename)
    cf.sendData(res, 'ERROR', 'ERROR', err)
  });
});
router.get('/mobile/appinfo', (req, res, next) => {
  let data = require('../infoapp.json')
  cf.sendData(res, 'SUCCESS', 'SUCCESS', data)
});

// router.post('/test/1', (req, res, next) => {
//   console.log(req.path)
//   console.log(req.body)
//   res.send({ a: 'aa' })
// })



// router
//   .use('/', (req, res, next) => {
//     console.log(req.path)
//     console.log(req.query)
//     next()
//   })
//   .route('/hoan')
//   .get((req, res, next) => {
//     console.log('get ')
//   })
//   .post(jsonParser, (req, res, next) => {
//     console.log('post ')

//   })
//   .put((req, res, next) => {
//     console.log('put ')

//   })
//   .delete((req, res, next) => {
//     console.log('del ')

//   })

module.exports = router;
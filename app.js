const express = require('express');
const logger = require('morgan');
const Sequelize = require('sequelize');
const config = require('./config');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(
  http,
  {
    pingInterval: config.pingInterval,
    pingTimeout: config.pingTimeout
  }
);
const models = require('./models');
const initData = require('./routers/admin/init')
models.config(config)

//router
const indexRouter = require('./routers/index');
const socket = require('./routers/socket')

app.use(cors());
// Log requests to the console.
app.use(logger('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());
// app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', indexRouter);

// app.post('/test2',(req,res,next)=>{
//   return console.log(req.body);
//   // return next();
// })
// Firebase
// const admin = require("firebase-admin");
// const serviceAccount = require("./vschools-appvenue-firebase-adminsdk-x6f94-98ab08062b.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://vschools-appvenue.firebaseio.com"
// });

// app.io = io;
// app.locals.io = io;
// app.locals.admin = admin;

models.sequelize.sync().then(() => {
  // app.listen(config.PORT, () => {
  //   console.log('App is listening on port: ' + config.PORT)
  // })
  var server_port = process.env.PORT || 80;
  http.listen(server_port, () => {
    console.log('App and Socket.io listening on: ' + config.PORT);
    initData();
  });
  socket.config(io)
});
module.exports = app;
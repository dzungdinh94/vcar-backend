const models = require('../../models');
const Encrypt = require('../../helpers/Encryption')
const cf = require('../../helpers/CF')

// CREATE DATABASE vantai CHARACTER SET utf8 COLLATE utf8_general_ci;

init = () => {
  models.User.findOrCreate({
    where: { email: 'admin@gmail.com' },
    defaults: {
      email: 'admin@gmail.com',
      password: Encrypt.encrypt('123456'),
      fullname: 'Administrator',
      type: 0,
      phone:"0909999999",
      username:"admin"
    },
    raw: true
  }).spread((data, isCreate) => {
    console.log(data)
  }).catch(err => {
    // console.log(err)
    cf.wirtelog(err, module.filename)
  });

 
  
}
module.exports = init;

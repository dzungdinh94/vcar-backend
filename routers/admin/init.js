const models = require('../../models');
const Encrypt = require('../../helpers/Encryption')
const cf = require('../../helpers/CF')

// CREATE DATABASE vantai CHARACTER SET utf8 COLLATE utf8_general_ci;

init = () => {
  models.Admin.findOrCreate({
    where: { username: 'admin' },
    defaults: {
      username: 'admin',
      password: Encrypt.encrypt('123456'),
      fullname: 'Administrator MrCoh',
      type: 1
    },
    raw: true
  }).spread((data, isCreate) => {
    console.log(data)
  }).catch(err => {
    // console.log(err)
    cf.wirtelog(err, module.filename)
  });

  models.sequelize.query(
    `CREATE  FUNCTION IF NOT EXISTS dictanceKm (lat1 FLOAT, lng1 FLOAT, lat2 FLOAT, lng2 FLOAT)
    RETURNS FLOAT
        RETURN 6371 * 2 * ASIN(SQRT(
            POWER(SIN((lat1 - abs(lat2)) * pi()/180 / 2),
            2) + COS(lat1 * pi()/180 ) * COS(abs(lat2) *
            pi()/180) * POWER(SIN((lng1 - lng2) *
            pi()/180 / 2), 2) ));
    `,
    { replacements: [], type: models.sequelize.QueryTypes.CREATE }
  ).then(data => {
  }).catch((err) => {
    cf.wirtelog(err, module.filename)
  });
  
}
module.exports = init;

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
let config = require('../config');
const db = {};

db.config = (config) => {
    //cos the tach config service ra day :))
}
// let sequelize = new Sequelize(config.databasesUrl);
const sequelize = new Sequelize(config.database.DATABASENAME, config.database.USER, config.database.PASSWORD, {
    host: config.database.HOST,
    dialect: config.database.DIALECT,
    operatorsAliases: false,
    port: config.database.PORT,
    dialectOptions: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

fs.readdirSync(__dirname)
    .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = sequelize;

module.exports = db;
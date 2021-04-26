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
const sequelize = new Sequelize("postgresql://postgres@localhost/vantai", { 
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: false
    }
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
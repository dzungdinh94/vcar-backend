'use strict';
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

const sequelize = new Sequelize(process.env.DATABASE_URL, { 
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: true
    }
});

// const sequelize = new Sequelize(config.database.DATABASENAME, config.database.USER, config.database.PASSWORD, {
//     host: config.database.HOST,
//     dialect: config.database.DIALECT,
//     operatorsAliases: false,
//     port: config.database.PORT,
//     define: {
//         underscored: false,
//         freezeTableName: false,
//         charset: 'utf8',
//         dialectOptions: {
//           collate: 'utf8_general_ci'
//         },
//         timestamps: true
//       },    
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// });


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
db.Sequelize = Sequelize;

module.exports = db;
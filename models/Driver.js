"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "Driver",
  {
    username: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    avatar: DataTypes.STRING,
    type: { type: DataTypes.INTEGER, defaultValue: 0 },
    numberCar: DataTypes.STRING,
    typeCarId: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    rate: DataTypes.FLOAT,
    status: DataTypes.INTEGER,
    isOnline: { type: DataTypes.INTEGER, defaultValue: 1 },
    imgCard: DataTypes.STRING,
    nameCar:DataTypes.STRING
  }
);
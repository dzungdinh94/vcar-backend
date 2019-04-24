"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "Order",
  {
    userId: DataTypes.INTEGER,
    typeCarId: DataTypes.INTEGER,
    fromLocation: DataTypes.STRING,
    toLocation: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.STRING,
    long: DataTypes.INTEGER,
    fromLat: DataTypes.FLOAT,
    fromLog: DataTypes.FLOAT,
    toLat: DataTypes.FLOAT,
    toLog: DataTypes.FLOAT,
    duration: DataTypes.INTEGER,
    timeStart: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    type: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 vừa tạo , 1 được chấp nhận , 2 đã được nhận , 3 user đã xóa , 4 hoàn  thành
    driverId:DataTypes.STRING,
  }
);
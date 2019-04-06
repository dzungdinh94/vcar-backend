"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "PriceTimeSlot",
  {
    typeCarId: DataTypes.INTEGER,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    price: DataTypes.INTEGER,
  }
);
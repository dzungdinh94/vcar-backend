"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "PriceDistance",
  {
    priceTimeSlotId: DataTypes.INTEGER,
    startDistance: DataTypes.INTEGER,
    endDistance: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
  }
);
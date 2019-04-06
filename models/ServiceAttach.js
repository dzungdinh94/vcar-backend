"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "ServiceAttach",
  {
    typeCarId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER,
  }
);
"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "TypeCar",
  {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    icon: DataTypes.STRING,
    img1x: DataTypes.STRING,
    img2x: DataTypes.STRING,
    img3x: DataTypes.STRING,
    weight: DataTypes.INTEGER,
    // createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }
);
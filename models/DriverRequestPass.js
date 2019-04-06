"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "DriverRequestPass",
  {
    driverId: DataTypes.INTEGER,
    reason: { type: DataTypes.STRING },
  }
);
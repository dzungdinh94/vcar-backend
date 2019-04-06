"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "ServiceAttachOrder",
  {
    serviceAttachId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    amount: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.INTEGER, defaultValue: 0 },
    name: DataTypes.STRING,
  }
);
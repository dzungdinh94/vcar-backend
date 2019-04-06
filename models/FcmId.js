"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "FcmId",
  {
    userId: DataTypes.INTEGER,
    fcmId: DataTypes.STRING,
    type: DataTypes.INTEGER,
    // createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }
);
"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "UserReadNotification",
  {
    notiId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    type: { type: DataTypes.INTEGER, defaultValue: 0 }, //0 user 1 lx
    status: { type: DataTypes.INTEGER, defaultValue: 1 }
  }
);
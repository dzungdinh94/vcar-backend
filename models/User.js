"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "User",
  {
    username: { type: DataTypes.STRING, },
    email: { type: DataTypes.STRING, },
    phone: { type: DataTypes.STRING, },
    idfacebook: DataTypes.STRING,
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    avatar: DataTypes.STRING,
    type: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
    numNoti: { type: DataTypes.INTEGER, defaultValue: 0 },
  }
);
"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "Admin",
  {
    username: { type: DataTypes.STRING, },
    email: { type: DataTypes.STRING, },
    phone: { type: DataTypes.STRING, },
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    avatar: DataTypes.STRING,
    type: { type: DataTypes.INTEGER, defaultValue: 0 }, //0 admin 1/super admin
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
    permisstion: DataTypes.STRING,
    // createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }
);
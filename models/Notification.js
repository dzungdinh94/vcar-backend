"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "Notification",
  {
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    url: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    userId: DataTypes.INTEGER, // 0 all user || one user
    type: { type: DataTypes.INTEGER, defaultValue: 0 }, //0 all - 1 user 2lx 
    status: { type: DataTypes.INTEGER, defaultValue: 0 },
    userCreated:  DataTypes.INTEGER,
  }
);
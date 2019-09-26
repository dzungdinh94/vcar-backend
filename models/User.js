"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    fullname:  {
      type:DataTypes.STRING,
      allowNull:false,
    },
    type: { type: DataTypes.INTEGER, defaultValue: 0,allowNull:false, },
    status: { type: DataTypes.INTEGER, defaultValue: 1,allowNull:false, }
  }
);
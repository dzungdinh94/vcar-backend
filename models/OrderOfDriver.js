"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
  "OrderOfDriver",
  {
    driverId: DataTypes.INTEGER,
    orderId: { type: DataTypes.INTEGER },
    status: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 vừa nhận , 1 hoàn thành , 3 huy chuyen
    rate: { type: DataTypes.INTEGER, defaultValue: 0 },
    endTime: DataTypes.DATE,
    // driverId:  {
    //   type: DataTypes.INTEGER,

    //   references: {
    //     model: 'Driver',
    //     key: 'id',
    //     // deferrable: DataTypes.Deferrable.INITIALLY_IMMEDIATE
    //   }
    // }
  }
);
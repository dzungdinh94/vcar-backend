"use strict";
module.exports = (sequelize, DataTypes) => sequelize.define(
    "Log",
    {
        itemId: DataTypes.STRING,
        userId: DataTypes.STRING,
        content: DataTypes.STRING,
        type: DataTypes.ENUM('app', 'media', 'message'),
        status: DataTypes.INTEGER,//0: ko trang thái 1:đã gửu 2:đã nhận 3:đã đọc
    }
);
"use strict";
module.exports = (sequelize, DataTypes) => {
    var Posts = sequelize.define(
        "Posts",
        {
            money: { type: DataTypes.INTEGER, allowNull: false },
            commission: { type: DataTypes.INTEGER, allowNull: false},
            address: { type: DataTypes.STRING, allowNull: false },
            title: {type: DataTypes.STRING, allowNull: false},
            area: {type:DataTypes.INTEGER, allowNull: false},
            pictures:{type: DataTypes.STRING,allowNull: false},
            description: {type:DataTypes.STRING,allowNull: false},
            type: { type: DataTypes.INTEGER, defaultValue: 0,allowNull: false },
            status: { type: DataTypes.INTEGER, defaultValue: 1,allowNull: false },
            sales: { type: DataTypes.STRING,allowNull: false },
            direction: { type: DataTypes.STRING,allowNull: false },
            phone: { type: DataTypes.STRING,allowNull: false },
            nameSeller: { type: DataTypes.STRING,allowNull: false },
        }
    );
    Posts.associate = function (models) {
        models.Posts.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
    };
    return Posts;
}
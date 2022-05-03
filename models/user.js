"use strict";
const { Model } = require("sequelize");
const joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Country, {
        as: "user_country",
        foreignKey: "country",
      });
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isTourist: { type: DataTypes.BOOLEAN, default: false },
      isStaff: { type: DataTypes.BOOLEAN, default: false },
      phone: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.TEXT,
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female", "Other"),
        allowNull: false,
        defaultValue: "Other",
      },
      country: {
        type: DataTypes.INTEGER,
        references: {
          model: "countries",
          key: "id",
        },
      },
    },

    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    }
  );
  return User;
};

const validateSchema = (data) => {
  const schema = joi.object({
    firstName: joi.string().required().min(3).max(50),
    lastName: joi.string().required().min(3).max(50),
    email: joi.string().email().required().min(5).max(225),
    phone: joi
      .string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .optional(),
    address: joi.string().min(3).max(225),
    gender: joi.string().valid("Male", "Female", "Other").required(),
    password: joi.string().required(),
    isStaff: joi.boolean(),
    isTourist: joi.boolean(),
    country: joi.number().required(),
  });
  return schema.validate(data);
};

module.exports.validateSchema = validateSchema;

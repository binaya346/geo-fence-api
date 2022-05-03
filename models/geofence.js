"use strict";
const { Model } = require("sequelize");
const joi = require("joi");

module.exports = (sequelize, DataTypes) => {
  class Geofence extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Geofence.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      longitude: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      latitude: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      radius: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      guid: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Geofence",
      tableName: "Geofences",
    }
  );
  return Geofence;
};

const validateSchema = (data) => {
  const schema = joi.object({
    name: joi.string().required().min(3).max(50),
    description: joi.string().min(3),
    longitude: joi.number().required(),
    latitude: joi.number().required(),
    radius: joi.number().required(),
    guid: joi.string().required(),
  });
  return schema.validate(data);
};

module.exports.validateSchema = validateSchema;

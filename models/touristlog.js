"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TouristLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Geofence, {
        as: "log_geofence",
        foreignKey: "geofence",
      });
      this.belongsTo(models.User, {
        as: "log_user",
        foreignKey: "user_id",
      });
    }
  }
  TouristLog.init(
    {
      geofence: {
        type: DataTypes.INTEGER,
        references: {
          model: "Geofences",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      isEntry: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
      remark: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "TouristLog",
    }
  );
  return TouristLog;
};

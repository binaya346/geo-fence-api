'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static associate(models) {}
  }
  Organization.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      description: DataTypes.TEXT,
      logo: DataTypes.STRING,
      colorCode: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Organization',
      tableName: 'organization'
    }
  )
  return Organization
}

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('categoria', {
    id_categoria: { type: DataTypes.INTEGER, field: 'ID_CATEGORIA', primaryKey: true, autoIncrement: true }},
    nombre_categoria: { type: DataTypes.STRING, field: 'NOMBRE_CATEGORIA', allowNull: false }},
  }, {
    tableName: 'CATEGORIA',
    timestamps: false
  });
};
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('estado', {
    id_estado: { type: DataTypes.INTEGER, field: 'ID_ESTADO', primaryKey: true, autoIncrement: true },
    descripcion: { type: DataTypes.STRING, field: 'DESCRIPCION', allowNull: false }
  }, {
    tableName: 'ESTADO',
    timestamps: false
  });
};
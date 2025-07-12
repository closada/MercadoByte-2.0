module.exports = (sequelize, DataTypes) => {
  return sequelize.define('localidad', {
    id_localidad: { type: DataTypes.INTEGER, field: 'ID_LOCALIDAD', primaryKey: true, autoIncrement: true }},
    codigo: { type: DataTypes.STRING, field: 'CODIGO', allowNull: false }},
    nombre: { type: DataTypes.STRING, field: 'NOMBRE', allowNull: false }},
  }, {
    tableName: 'LOCALIDAD',
    timestamps: false
  });
};
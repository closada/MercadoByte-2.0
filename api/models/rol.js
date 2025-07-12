module.exports = (sequelize, DataTypes) => {
  return sequelize.define('rol', {
    id_rol: { type: DataTypes.INTEGER, field: 'ID_ROL', primaryKey: true, autoIncrement: true }},
    codigo: { type: DataTypes.STRING, field: 'CODIGO', allowNull: false }},
    nombre: { type: DataTypes.STRING, field: 'NOMBRE', allowNull: false }},
  }, {
    tableName: 'ROL',
    timestamps: false
  });
};
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('menu', {
    id_menu: { type: DataTypes.INTEGER, field: 'ID_MENU', primaryKey: true, autoIncrement: true }},
    titulo: { type: DataTypes.STRING, field: 'TITULO', allowNull: false }},
    accion: { type: DataTypes.STRING, field: 'ACCION', allowNull: false }},
    id_rol: { type: DataTypes.INTEGER, field: 'ID_ROL', allowNull: false }},
  }, {
    tableName: 'MENU',
    timestamps: false
  });
};
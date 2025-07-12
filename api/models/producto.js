module.exports = (sequelize, DataTypes) => {
  return sequelize.define('producto', {
    id_producto: { type: DataTypes.INTEGER, field: 'ID_PRODUCTO', primaryKey: true, autoIncrement: true }},
    nombre: { type: DataTypes.STRING, field: 'NOMBRE', allowNull: false }},
    ean: { type: DataTypes.STRING, field: 'EAN', allowNull: false }},
    id_categoria: { type: DataTypes.INTEGER, field: 'ID_CATEGORIA', allowNull: false }},
  }, {
    tableName: 'PRODUCTO',
    timestamps: false
  });
};
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('publicacion', {
    id_publicacion: { type: DataTypes.INTEGER, field: 'ID_PUBLICACION', primaryKey: true, autoIncrement: true },
    id_producto: { type: DataTypes.INTEGER, field: 'ID_PRODUCTO', allowNull: false },
    id_vendedor: { type: DataTypes.INTEGER, field: 'ID_VENDEDOR', allowNull: false },
    breve_descripcion: { type: DataTypes.STRING, field: 'BREVE_DESCRIPCION' },
    stock: { type: DataTypes.INTEGER, field: 'STOCK', allowNull: false },
    costo: { type: DataTypes.DOUBLE, field: 'COSTO', allowNull: false },
    ruta_imagen: { type: DataTypes.STRING, field: 'RUTA_IMAGEN' },
    activa: { type: DataTypes.INTEGER, field: 'ACTIVA', allowNull: false }
  }, {
    tableName: 'PUBLICACION',
    timestamps: false
  });
};
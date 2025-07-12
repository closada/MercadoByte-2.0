module.exports = (sequelize, DataTypes) => {
  return sequelize.define('venta', {
    id_venta: { type: DataTypes.INTEGER, field: 'ID_VENTA', primaryKey: true, autoIncrement: true }},
    nro_venta: { type: DataTypes.STRING, field: 'NRO_VENTA', allowNull: false }},
    fecha_pedido: { type: DataTypes.STRING, field: 'FECHA_PEDIDO', allowNull: false }},
    id_cliente: { type: DataTypes.INTEGER, field: 'ID_CLIENTE', allowNull: false }},
    id_publicacion: { type: DataTypes.INTEGER, field: 'ID_PUBLICACION', allowNull: false }},
    cantidad: { type: DataTypes.INTEGER, field: 'CANTIDAD', allowNull: false }},
    costo: { type: DataTypes.DOUBLE, field: 'COSTO', allowNull: false }},
    id_estado: { type: DataTypes.INTEGER, field: 'ID_ESTADO', allowNull: false }},
    fecha_entrega: { type: DataTypes.STRING, field: 'FECHA_ENTREGA' }},
  }, {
    tableName: 'VENTA',
    timestamps: false
  });
};
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('opinion', {
    id_opinion: { type: DataTypes.INTEGER, field: 'ID_OPINION', primaryKey: true, autoIncrement: true },
    id_venta: { type: DataTypes.INTEGER, field: 'ID_VENTA', allowNull: false },
    puntaje: { type: DataTypes.INTEGER, field: 'PUNTAJE', allowNull: false },
    comentario: { type: DataTypes.STRING, field: 'COMENTARIO' }
  }, {
    tableName: 'OPINION',
    timestamps: false
  });
};
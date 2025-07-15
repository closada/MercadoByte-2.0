module.exports = (sequelize, DataTypes) => {
  return sequelize.define('pregunta_respuesta', {
    id_pregunta_respuesta: { type: DataTypes.INTEGER, field: 'ID_PREGUNTA_RESPUESTA', primaryKey: true, autoIncrement: true },
    id_publicacion: { type: DataTypes.INTEGER, field: 'ID_PUBLICACION', allowNull: false },
    id_cliente: { type: DataTypes.INTEGER, field: 'ID_CLIENTE', allowNull: false },
    pregunta: { type: DataTypes.STRING, field: 'PREGUNTA', allowNull: false },
    fecha_pregunta: { type: DataTypes.STRING, field: 'FECHA_PREGUNTA', allowNull: false },
    respuesta: { type: DataTypes.STRING, field: 'RESPUESTA' },
    fecha_respuesta: { type: DataTypes.STRING, field: 'FECHA_RESPUESTA' },
  }, {
    tableName: 'PREGUNTA_RESPUESTA',
    timestamps: false
  });
};
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('usuario', {
    id_usuario: { type: DataTypes.INTEGER, field: 'ID_USUARIO', primaryKey: true, autoIncrement: true }},
    nombre: { type: DataTypes.STRING, field: 'NOMBRE', allowNull: false }},
    apellido: { type: DataTypes.STRING, field: 'APELLIDO', allowNull: false }},
    dni: { type: DataTypes.STRING, field: 'DNI', allowNull: false }},
    edad: { type: DataTypes.INTEGER, field: 'EDAD' }},
    email: { type: DataTypes.STRING, field: 'EMAIL', allowNull: false }},
    password: { type: DataTypes.STRING, field: 'PASSWORD', allowNull: false }},
    domicilio: { type: DataTypes.STRING, field: 'DOMICILIO' }},
    id_localidad: { type: DataTypes.INTEGER, field: 'ID_LOCALIDAD' }},
    id_rol: { type: DataTypes.INTEGER, field: 'ID_ROL', allowNull: false }},
    token: { type: DataTypes.STRING, field: 'TOKEN' }},
  }, {
    tableName: 'USUARIO',
    timestamps: false
  });
};
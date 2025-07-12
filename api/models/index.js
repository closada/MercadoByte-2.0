const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'mercadobyte.db'),
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.localidad = require('./localidad')(sequelize, DataTypes);
db.rol = require('./rol')(sequelize, DataTypes);
db.usuario = require('./usuario')(sequelize, DataTypes);
db.menu = require('./menu')(sequelize, DataTypes);
db.estado = require('./estado')(sequelize, DataTypes);
db.categoria = require('./categoria')(sequelize, DataTypes);
db.producto = require('./producto')(sequelize, DataTypes);
db.publicacion = require('./publicacion')(sequelize, DataTypes);
db.venta = require('./venta')(sequelize, DataTypes);
db.opinion = require('./opinion')(sequelize, DataTypes);
db.pregunta_respuesta = require('./pregunta_respuesta')(sequelize, DataTypes);


// Relaciones
db.usuario.belongsTo(db.localidad, { foreignKey: 'ID_LOCALIDAD' });
db.usuario.belongsTo(db.rol, { foreignKey: 'ID_ROL' });

db.producto.belongsTo(db.categoria, { foreignKey: 'ID_CATEGORIA' });

db.publicacion.belongsTo(db.producto, { foreignKey: 'ID_PRODUCTO' });
db.publicacion.belongsTo(db.usuario, { as: 'vendedor', foreignKey: 'ID_VENDEDOR' });

db.venta.belongsTo(db.usuario, { as: 'cliente', foreignKey: 'ID_CLIENTE' });
db.venta.belongsTo(db.publicacion, { foreignKey: 'ID_PUBLICACION' });
db.venta.belongsTo(db.estado, { foreignKey: 'ID_ESTADO' });

db.opinion.belongsTo(db.venta, { foreignKey: 'ID_VENTA' });

db.menu.belongsTo(db.rol, { foreignKey: 'ID_ROL' });

db.pregunta_respuesta.belongsTo(db.publicacion, { foreignKey: 'ID_PUBLICACION' });
db.pregunta_respuesta.belongsTo(db.usuario, { as: 'cliente', foreignKey: 'ID_CLIENTE' });

module.exports = db;

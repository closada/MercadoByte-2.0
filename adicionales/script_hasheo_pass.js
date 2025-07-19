const bcrypt = require('bcrypt');
const db = require('./api/models'); // Ajustá la ruta si tu carpeta Sequelize es distinta

(async () => {
  try {
    const usuarios = await db.usuario.findAll();

    for (const usuario of usuarios) {
      const passwordActual = usuario.password;

      // Verificamos si ya está hasheada (los hashes bcrypt empiezan con $2)
      if (!passwordActual.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(passwordActual, 10);
        await usuario.update({ password: hashedPassword });
        console.log(`✅ Contraseña actualizada para usuario ID: ${usuario.id_usuario}`);
      } else {
        console.log(`🔒 Usuario ID ${usuario.id_usuario} ya tiene contraseña hasheada`);
      }
    }

    console.log('✅ Migración de contraseñas completada.');
    process.exit();
  } catch (error) {
    console.error('❌ Error al migrar contraseñas:', error);
    process.exit(1);
  }
})();

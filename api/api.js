const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./models');
const { generarToken, requiereLogin } = require('./middlewares/auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('../assets/img', express.static(path.join(__dirname, '../assets/img')));

// ========= 1. LOGIN / AUTENTICAR =========
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const usuario = await db.usuario.findOne({
    where: { email, password },
    include: db.rol
  });

  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generarToken(usuario);
  res.json({ token, usuario });
});

// ========= 2. GETMENUCONPARAMETROS =========
// Devuelve menú visible según el rol del usuario autenticado
app.get('/menu', requiereLogin, async (req, res) => {
  const menu = await db.menu.findAll({
    where: { ID_ROL: req.user.id_rol } // id_rol viene del JWT generado
  });

  res.json(menu);
});

// ========= 3. POSTPUBLICACION =========
// Crea una publicación nueva con imagen base64
app.post('/publicaciones', requiereLogin, async (req, res) => {
  const { id_producto, breve_descripcion, stock, costo, base64 } = req.body;

  let rutaImagen = null;
  if (base64) {
    const filename = `${Date.now()}.png`;
    const filePath = path.join(__dirname, 'assets/img', filename);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    rutaImagen = `assets/img/${filename}`;
  }

  const publicacion = await db.publicacion.create({
    ID_PRODUCTO: id_producto,
    ID_VENDEDOR: req.user.id,
    BREVE_DESCRIPCION: breve_descripcion,
    STOCK: stock,
    COSTO: costo,
    RUTA_IMAGEN: rutaImagen,
    ACTIVA: 1
  });

  res.json({ id_publicacion: publicacion.ID_PUBLICACION });
});

// ========= LISTEN SERVER =========
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`✔ API corriendo en http://localhost:${PORT}`);
  });
});

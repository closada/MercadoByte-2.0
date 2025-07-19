const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./models');
const { generarToken, requiereLogin } = require('./middlewares/auth');
const { Op } = require('sequelize');

const bcrypt = require('bcrypt');


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('../assets/img', express.static(path.join(__dirname, '../public/assets/img')));

// ========= LOGIN / AUTENTICAR =========
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscamos solo por email
    const usuario = await db.usuario.findOne({
      where: { email },
      include: db.rol
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparamos la contraseña enviada con la guardada (hasheada)
    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    await usuario.update({ token });

    res.json({ token });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// ========= GETMENUCONPARAMETROS =========
app.get('/menu/:idRol', async (req, res) => {
   const idRol = parseInt(req.params.idRol);
  if (isNaN(idRol)) return res.status(400).json({ error: 'ID no válido' });

  const menu = await db.menu.findAll({
    where: { ID_ROL: idRol }
  });

  res.json(menu);
});

// ========= getPublicaciones =========
app.get('/publicaciones', async (req, res) => {
  const sql = `
    SELECT c.id_categoria       AS id_categoria,
           c.nombre_categoria   AS categoria,
           GROUP_CONCAT(
             '{"id_publicacion":' || pu.id_publicacion ||
             ',"modelo":"'|| REPLACE(p.nombre,'"','""') || 
             '","precio":'|| pu.costo ||
             ',"ruta_imagen":"' || IFNULL(pu.ruta_imagen,'') || '"}'
           , '##') AS productos
      FROM publicacion pu
      JOIN producto   p ON pu.ID_PRODUCTO = p.ID_PRODUCTO
      JOIN categoria  c ON p.ID_CATEGORIA = c.ID_CATEGORIA
     WHERE pu.activa = 1 AND pu.stock > 0
     GROUP BY c.id_categoria, c.nombre_categoria;
  `;

  const rows = await db.sequelize.query(sql, { type: db.Sequelize.QueryTypes.SELECT });


  const resultado = rows.map(r => ({
    id_categoria: r.id_categoria,
    categoria: r.categoria,
    productos: r.productos
      ? r.productos.split('##').map(x => JSON.parse(x))
      : null
  }));

  res.json(resultado);
});


// ========= getMisdatosConParametros =========
app.get('/misdatos/:idUsuario', async (req, res) => {
   const idUsuario = parseInt(req.params.idUsuario);
  if (isNaN(idUsuario)) return res.status(400).json({ error: 'ID no válido' });

  const usuario = await db.usuario.findOne({
    where: { ID_USUARIO: idUsuario },
    attributes: [
      ['ID_USUARIO', 'id'],
      [db.Sequelize.literal("NOMBRE || ' ' || APELLIDO"), 'nombre'],
      'DNI',
      'EMAIL',
      'DOMICILIO',
      'ID_LOCALIDAD',
      'PASSWORD'
    ],
    raw: true
  });

  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(usuario);
});


// ========= getPublicacionConParametros =========
app.get('/publicacion/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const sql = `
    SELECT 
      pr.nombre AS producto_nombre,
      pr.ean AS ean,
      MAX(pub.costo) AS precio,
      MAX(pub.stock) AS stock,
      MAX(pub.breve_descripcion) AS descripcion,
      MAX(pub.ruta_imagen) AS img,
      pub.activa AS activa,
      op.opiniones,
      pyr.preg_resp AS preguntas_respuestas
    FROM publicacion pub
    INNER JOIN producto pr ON pub.id_producto = pr.id_producto
    LEFT JOIN (
      SELECT 
        v.id_publicacion,
        GROUP_CONCAT(
          '{"id_opinion":' || o.id_opinion || 
          ',"puntaje":' || o.puntaje ||
          ',"comentario":"' || 
            CASE 
              WHEN o.comentario IS NULL OR o.comentario = '' THEN ''
              ELSE REPLACE(o.comentario, '"', '""') 
            END
          || '"}'
        , '##') AS opiniones
      FROM venta v
      INNER JOIN opinion o ON v.id_venta = o.id_venta
      GROUP BY v.id_publicacion
    ) op ON op.id_publicacion = pub.id_publicacion
    LEFT JOIN (
      SELECT 
        id_publicacion,
        GROUP_CONCAT(
          '{"id_cliente":' || id_cliente ||
          ',"pregunta":"' || REPLACE(pregunta, '"', '""') || '"' ||
          ',"fecha_pregunta":"' || fecha_pregunta || '"' ||
          ',"respuesta":' || 
            CASE 
              WHEN respuesta IS NULL THEN 'null' 
              ELSE '"' || REPLACE(respuesta, '"', '""') || '"' 
            END ||
          ',"fecha_respuesta":' || 
            CASE 
              WHEN fecha_respuesta IS NULL THEN 'null' 
              ELSE '"' || fecha_respuesta || '"' 
            END || '}'
        , '##') AS preg_resp
      FROM pregunta_respuesta
      GROUP BY id_publicacion
    ) pyr ON pyr.id_publicacion = pub.id_publicacion
    WHERE pub.id_publicacion = ?
    GROUP BY pub.id_publicacion, pr.nombre
  `;

  const rows = await db.sequelize.query(sql, {
    replacements: [id],
    type: db.Sequelize.QueryTypes.SELECT
  });

  if (rows.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

  const fila = rows[0];

  // Procesar opiniones (convertir strings JSON en arrays)
  const opiniones_raw = fila.opiniones?.split('##') ?? [];
  fila.opiniones = opiniones_raw.length && opiniones_raw[0] !== ""
    ? opiniones_raw.map(p => JSON.parse(p))
    : null;

  // Procesar preguntas y respuestas
  const preguntas_raw = fila.preguntas_respuestas?.split('##') ?? [];
  fila.preguntas_respuestas = preguntas_raw.length && preguntas_raw[0] !== ""
    ? preguntas_raw.map(p => JSON.parse(p))
    : null;

  res.json(fila);
});


// ========= getLocalidades =========
app.get('/localidades', async (req, res) => {
  const sql = `
    SELECT 0 AS id_localidad, 'Seleccione una opcion..' AS nombre_localidad
    UNION
    SELECT ID_LOCALIDAD AS id_localidad, NOMBRE AS nombre_localidad
    FROM LOCALIDAD
  `;

  const localidades = await db.sequelize.query(sql, {
    type: db.Sequelize.QueryTypes.SELECT
  });

  res.json(localidades);
});

// ========= getCategorias =========
app.get('/categorias', async (req, res) => {

  const categorias = await db.categoria.findAll({
	  attributes: [
      ['id_categoria', 'id'],
      ['nombre_categoria', 'categoria'],
    ],
  });

  res.json(categorias);
});

// ========= getProductosConParametros =========
app.get('/productos/:idCategoria', async (req, res) => {
   const idCategoria = parseInt(req.params.idCategoria);
  if (isNaN(idCategoria)) return res.status(400).json({ error: 'ID no válido' });

  const productos = await db.producto.findAll({
    where: { ID_CATEGORIA: idCategoria },
    attributes: [
      ['id_producto', 'id'],
      'nombre',
      'ean',
      'id_categoria'
    ],
    raw: true
  });

  if (!productos) return res.status(404).json({ error: 'Productos no encontrados' });
  res.json(productos);
});


// ========= patchOpinion =========
app.patch('/opinion/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { puntaje, comentario } = req.body;

  // Validaciones básicas
  if (typeof puntaje !== 'number') {
    return res.status(400).json({ error: 'Puntaje debe ser numérico' });
  }

  try {
    const result = await db.opinion.update(
      {
        puntaje: puntaje,
        comentario: comentario || null
      },
      {
        where: { ID_VENTA: id }
      }
    );

    if (result[0] === 0) {
      return res.status(404).json({ error: 'Opinión no encontrada para esa venta' });
    }

    res.json({ id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la opinión' });
  }
});


// ========= patchRespuesta =========
app.patch('/respuesta/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { respuesta } = req.body;
  const fecha_respuesta = req.body.fecha_respuesta || new Date().toISOString().slice(0, 10);


  try {
	  
    const filas = await db.pregunta_respuesta.update(
      {
        respuesta:       respuesta,
        fecha_respuesta: fecha_respuesta
      },
      {
        where: { ID_PREGUNTA_RESPUESTA: id }
      }
    );
	

    if (filas[0] === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.json({ id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la respuesta' });
  }
});


// ========= patchUsuario =========
app.patch('/usuario/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { domicilio, id_localidad, password } = req.body;

  const datosActualizar = {};

  if (domicilio !== undefined) datosActualizar.domicilio = domicilio;
  if (id_localidad !== undefined) {
    const loc = parseInt(id_localidad);
    if (isNaN(loc)) return res.status(400).json({ error: 'id_localidad inválido' });
    datosActualizar.id_localidad = loc;
  }

  if (password !== undefined && password.trim() !== '') {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      datosActualizar.password = hashedPassword;
    } catch (err) {
      console.error('Error al hashear la contraseña:', err);
      return res.status(500).json({ error: 'Error al procesar la contraseña' });
    }
  }

  try {
    const [filasActualizadas] = await db.usuario.update(
      datosActualizar,
      { where: { id_usuario: id } }
    );

    if (filasActualizadas === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});



// ========= patchProducto =========
app.patch('/producto/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { nombre, ean, id_categoria } = req.body;

  if (!nombre || !ean || id_categoria === undefined) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const categoriaInt = parseInt(id_categoria);
  if (isNaN(categoriaInt)) {
    return res.status(400).json({ error: 'id_categoria inválido' });
  }

  try {
    // 1) Verificamos si existe otro producto con ese ean
    const productoExistente = await db.producto.findOne({
      where: {
        ean,
        id_producto: { [Op.ne]: id }  // distinto al producto que queremos actualizar
      }
    });

    if (productoExistente) {
      return res.status(409).json({ error: 'El EAN ya existe en otro producto' });
    }

    // 2) Actualizamos el producto
    const [filasActualizadas] = await db.producto.update(
      {
        nombre,
        id_categoria: categoriaInt,
        ean
      },
      {
        where: { id_producto: id }
      }
    );

    if (filasActualizadas === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});


// ========= patchCategoria =========
app.patch('/categoria/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { categoria } = req.body;

  if (!categoria || typeof categoria !== 'string') {
    return res.status(400).json({ error: 'Campo "categoria" es requerido y debe ser texto' });
  }

  try {
    // Buscar si hay otra categoría con el mismo nombre, distinto id
    const categoriaExistente = await db.categoria.findOne({
      where: {
        nombre_categoria: categoria,
        id_categoria: { [Op.ne]: id }
      }
    });

    if (categoriaExistente) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    // Actualizar categoría
    const [filasActualizadas] = await db.categoria.update(
      { nombre_categoria: categoria },
      { where: { id_categoria: id } }
    );

    if (filasActualizadas === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
});

// ========= patchestadoVenta =========
app.patch('/estadoventa/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const fecha = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // 1) Obtener id_estado para descripción 'Finalizado'
    const estadoFinalizado = await db.estado.findOne({
      where: { descripcion: 'Finalizado' },
      attributes: ['id_estado']
    });

    if (!estadoFinalizado) {
      return res.status(500).json({ error: 'Estado "Finalizado" no encontrado' });
    }

    // 2) Actualizar la venta con ese id_estado y fecha_entrega
    const [filasActualizadas] = await db.venta.update(
      {
        id_estado: estadoFinalizado.id_estado,
        fecha_entrega: fecha
      },
      { where: { id_venta: id } }
    );

    if (filasActualizadas === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado de la venta' });
  }
});

// ========= patchPublicacion =========
app.patch('/publicacion', async (req, res) => {
  const { id_publicacion, nuevo_estado } = req.body;

  const publicacionId = parseInt(id_publicacion);
  const nuevoEstadoInt = parseInt(nuevo_estado);

  if (isNaN(publicacionId) || isNaN(nuevoEstadoInt)) {
    return res.status(400).json({ error: 'id_publicacion y nuevo_estado deben ser números válidos' });
  }

  try {
    const [filasActualizadas] = await db.publicacion.update(
      { activa: nuevoEstadoInt },
      { where: { id_publicacion: publicacionId } }
    );

    if (filasActualizadas === 0) {
      return res.status(400).json({ error: 'No se pudo actualizar la publicación (id no encontrado)' });
    }

    res.json({});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la publicación' });
  }
});



// ========= patchEditpublicacion =========

app.patch('/editpublicacion/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { descripcion, stock, total, imgnombre, imgbase64 } = req.body;

  if (typeof descripcion !== 'string' || typeof stock !== 'number' || typeof total !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos o incompletos' });
  }

  try {
    const datosActualizar = {
      breve_descripcion: descripcion,
      stock,
      costo: total
    };

    if (imgnombre && imgbase64) {
      // Decodificar base64
      const archivoBuffer = Buffer.from(imgbase64, 'base64');

      // Crear nombre con timestamp
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      const nombreArchivo = `${timestamp}_${imgnombre}`;

      // Ruta absoluta donde se guardará la imagen
      const filePath = path.join(__dirname, '..', 'public', 'assets', 'img', nombreArchivo);

      // Guardar archivo en disco
      await fs.promises.writeFile(filePath, archivoBuffer);

      // Guardar ruta relativa en la base de datos
      datosActualizar.ruta_imagen = path.join('assets', 'img', nombreArchivo).replace(/\\/g, '/'); // para usar '/' siempre
    }

    const [filasActualizadas] = await db.publicacion.update(datosActualizar, { where: { id_publicacion: id } });

    if (filasActualizadas === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json({});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la publicación' });
  }
});

// ========= postOpinion =========
app.post('/opinion', async (req, res) => {
  const { comentario, puntaje, id_venta } = req.body;

  // Validaciones básicas
  if (
    typeof comentario !== 'string' ||
    isNaN(parseInt(puntaje)) ||
    isNaN(parseInt(id_venta))
  ) {
    return res.status(400).json({ error: 'Datos inválidos o incompletos' });
  }

  try {
    const nuevaOpinion = await db.opinion.create({
      comentario,
      puntaje: parseInt(puntaje),
      id_venta: parseInt(id_venta)
    });

    // Devuelvo el id insertado
    res.json({ id: nuevaOpinion.id_opinion });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo insertar la opinión' });
  }
});


// ========= patchLogout =========
app.patch('/logout', async (req, res) => {
  const { id_usuario } = req.body;

  const UsuarioId = parseInt(id_usuario);

  if (isNaN(UsuarioId)) {
    return res.status(400).json({ error: 'id_usuario debe ser un número válido' });
  }

  try {
    const [filasActualizadas] = await db.usuario.update(
      { token: null },
      { where: { id_usuario: UsuarioId } }
    );

    if (filasActualizadas === 0) {
      return res.status(400).json({ error: 'No se pudo actualizar el usuario (id no encontrado)' });
    }

    res.json({});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});


// ========= postBuscador =========
app.post('/buscador', async (req, res) => {
  const { texto } = req.body;

  if (!texto || typeof texto !== 'string') {
    return res.status(400).json({ error: 'Texto de búsqueda inválido' });
  }

  try {
    const resultados = await db.publicacion.findAll({
      where: {
        activa: 1,
        stock: { [Op.gt]: 0 }
      },
      include: [
        {
          model: db.producto,
          as: 'producto',
          where: {
            nombre: {
              [Op.like]: `%${texto}%`
            }
          },
          attributes: ['nombre']
        }
      ],
      attributes: ['id_publicacion', 'costo', 'ruta_imagen']
    });

    const respuesta = resultados.map(pub => ({
      id_publicacion: pub.id_publicacion,
      modelo: pub.producto.nombre,
      precio: pub.costo,
      ruta_imagen: pub.ruta_imagen
    }));

    res.json(respuesta);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
});


// ========= postPregunta =========
app.post('/pregunta', async (req, res) => {
  const { pregunta, id_publicacion, id_cliente } = req.body;

  if (
    typeof pregunta !== 'string' ||
    isNaN(parseInt(id_publicacion)) ||
    isNaN(parseInt(id_cliente))
  ) {
    return res.status(400).json({ error: 'Datos inválidos o incompletos' });
  }

  const fecha_pregunta = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    const nuevaPregunta = await db.pregunta_respuesta.create({
      id_publicacion: parseInt(id_publicacion),
      id_cliente: parseInt(id_cliente),
      pregunta,
      fecha_pregunta
    });

    res.json({ id: nuevaPregunta.id_pregunta_respuesta });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo insertar la pregunta' });
  }
});


// ========= postProducto =========
app.post('/producto', async (req, res) => {
  const { nombre, ean, id_categoria } = req.body;

  if (!nombre || !ean || isNaN(parseInt(id_categoria))) {
    return res.status(400).json({ error: 'Datos inválidos o incompletos' });
  }

  try {
    // Verificar si el producto ya existe
    const existente = await db.producto.findOne({ where: { ean } });

    if (existente) {
      return res.status(401).json({ error: 'Ya existe un producto con ese EAN' });
    }

    // Insertar producto nuevo
    await db.producto.create({
      nombre,
      ean,
      id_categoria: parseInt(id_categoria)
    });

    res.json({});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al insertar el producto' });
  }
});


// ========= postPublicacion =========
app.post('/publicacion', async (req, res) => {
  const { descripcion, id_producto, id_usuario, stock, total, imgnombre, imgbase64 } = req.body;

  if (
    !descripcion || typeof descripcion !== 'string' ||
    isNaN(parseInt(id_producto)) ||
    isNaN(parseInt(id_usuario)) ||
    isNaN(parseInt(stock)) ||
    isNaN(parseFloat(total))
  ) {
    return res.status(400).json({ error: 'Datos inválidos o incompletos' });
  }

  let ruta_imagen = null;

  // Guardar imagen si se proporcionó
  if (imgnombre && imgbase64) {
    try {
      const buffer = Buffer.from(imgbase64, 'base64');
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      const nombreArchivo = `${timestamp}_${imgnombre}`;
      const fullPath = path.join(__dirname, '..', 'public', 'assets', 'img', nombreArchivo);

      fs.writeFileSync(fullPath, buffer);
      ruta_imagen = path.join('assets', 'img', nombreArchivo).replace(/\\/g, '/');
    } catch (err) {
      console.error('Error al guardar la imagen:', err);
      return res.status(500).json({ error: 'No se pudo guardar la imagen' });
    }
  }

  try {
    const nuevaPublicacion = await db.publicacion.create({
      id_producto: parseInt(id_producto),
      id_vendedor: parseInt(id_usuario),
      breve_descripcion: descripcion,
      stock: parseInt(stock),
      costo: parseFloat(total),
      activa: 1,
      ...(ruta_imagen && { ruta_imagen }) // solo se incluye si existe
    });

    res.json({ id: nuevaPublicacion.id_publicacion });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo insertar la publicación' });
  }
});

// ========= postCompra =========
app.post('/compra', async (req, res) => {
  const { fecha_venta, nro_venta, id_publicacion, id_comprador, cantidad, costo } = req.body;

  if (
    !fecha_venta || !nro_venta ||
    isNaN(parseInt(id_publicacion)) ||
    isNaN(parseInt(id_comprador)) ||
    isNaN(parseInt(cantidad)) ||
    isNaN(parseFloat(costo))
  ) {
    return res.status(400).json({ error: 'Datos inválidos o incompletos' });
  }

  try {
    // Buscar el ID de estado 'Pendiente'
    const estadoPendiente = await db.estado.findOne({ where: { descripcion: 'Pendiente' } });

    if (!estadoPendiente) {
      return res.status(500).json({ error: 'Estado "Pendiente" no encontrado' });
    }

    // Crear la venta
    const nuevaVenta = await db.venta.create({
      nro_venta,
      fecha_pedido: fecha_venta,
      id_cliente: parseInt(id_comprador),
      id_publicacion: parseInt(id_publicacion),
      cantidad: parseInt(cantidad),
      costo: parseFloat(costo),
      id_estado: estadoPendiente.id_estado
    });

    // Actualizar stock de la publicación
    await db.publicacion.increment(
      { stock: -cantidad },
      { where: { id_publicacion: id_publicacion } }
    );

    res.json({ id: nuevaVenta.id_venta });

  } catch (error) {
    console.error('Error al registrar compra:', error);
    res.status(500).json({ error: 'Error al registrar la compra' });
  }
});


// ========= postCategoria =========
app.post('/categoria', async (req, res) => {
  const { categoria } = req.body;

  if (!categoria || typeof categoria !== 'string') {
    return res.status(400).json({ error: 'Nombre de categoría inválido' });
  }

  try {
    // Verificar si ya existe
    const existente = await db.categoria.findOne({ where: { nombre_categoria: categoria } });

    if (existente) {
      return res.status(409).json({ error: 'Categoría ya existente' });
    }

    // Crear nueva categoría
    await db.categoria.create({ nombre_categoria: categoria });

    res.json({});

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'No se pudo insertar la categoría' });
  }
});


// ========= deleteProducto =========
app.delete('/producto/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const publicaciones = await db.publicacion.findAll({ where: { id_producto: id } });

    if (publicaciones.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar: tiene publicaciones asociadas' });
    }

    await db.producto.destroy({ where: { id_producto: id } });
    res.json({ id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});


// ========= deleteCategoria =========
app.delete('/categoria/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const productos = await db.producto.findAll({ where: { id_categoria: id } });

    if (productos.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar: tiene productos asociados' });
    }

    await db.categoria.destroy({ where: { id_categoria: id } });
    res.json({ id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});


// ========= getComprasConParametros =========
app.get('/compras/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const compras = await db.venta.findAll({
      where: { id_cliente: id },
      include: [
        {
          model: db.publicacion,
          include: [
            { model: db.producto, attributes: ['nombre'] }
          ],
          attributes: ['id_publicacion', 'ruta_imagen']
        },
        {
          model: db.estado,
          attributes: ['descripcion']
        },
        {
          model: db.opinion,
          attributes: ['id_opinion', 'puntaje', 'comentario'],
          required: false
        }
      ]
    });
	
	console.log(compras);

    const result = compras.map(v => ({
      id_publicacion: v.publicacion.id_publicacion,
      id_venta: v.id_venta,
      nro_venta: v.nro_venta,
      cant: v.cantidad,
      total: v.costo,
      producto: v.publicacion.producto.nombre,
      costo: v.costo / v.cantidad,
      estado: v.estado.descripcion,
      img: v.publicacion.ruta_imagen,
      ...v.opinion ? {
        id_opinion: v.opinion.id_opinion,
        puntaje: v.opinion.puntaje,
        comentario: v.opinion.comentario
      } : {}
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});


// ========= getMispreguntasConParametros =========
app.get('/mispreguntas/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const preguntas = await db.pregunta_respuesta.findAll({
      where: { id_cliente: id },
      include: {
        model: db.publicacion,
        include: { model: db.producto },
        attributes: ['id_publicacion', 'ruta_imagen']
      }
    });

    const result = preguntas.map(p => ({
      id: p.id_pregunta_respuesta,
      id_publicacion: p.publicacion.id_publicacion,
      nombre_producto: p.publicacion.producto.nombre,
      imagen: p.publicacion.ruta_imagen,
      pregunta: p.pregunta,
      fecha_pregunta: p.fecha_pregunta,
      respuesta: p.respuesta,
      fecha_respuesta: p.fecha_respuesta
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});


// ========= getMispreguntasvendConParametros =========
app.get('/mispreguntasvend/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const preguntas = await db.pregunta_respuesta.findAll({
      include: {
        model: db.publicacion,
        where: { id_vendedor: id },
        include: { model: db.producto },
        attributes: ['id_publicacion', 'ruta_imagen']
      }
    });

    const result = preguntas.map(p => ({
      id: p.id_pregunta_respuesta,
      id_publicacion: p.publicacion.id_publicacion,
      nombre_producto: p.publicacion.producto.nombre,
      imagen: p.publicacion.ruta_imagen,
      pregunta: p.pregunta,
      fecha_pregunta: p.fecha_pregunta,
      respuesta: p.respuesta,
      fecha_respuesta: p.fecha_respuesta
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener preguntas al vendedor' });
  }
});


// ========= getOpinionConParametros =========
app.get('/opinion/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const opinion = await db.opinion.findOne({
      where: { id_venta: id },
      attributes: ['id_venta', 'puntaje', 'comentario']
    });

    res.json(opinion || null);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener opinión' });
  }
});


// ========= getTokenConParametros =========
app.get('/token/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const usuario = await db.usuario.findByPk(id, { attributes: ['token'] });
    res.json(usuario);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener token' });
  }
});


// ========= getVentasConParametros =========
app.get('/ventas/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const ventas = await db.venta.findAll({
      include: [
        {
          model: db.publicacion,
          where: { id_vendedor: id },
          include: { model: db.producto }
        },
        {
          model: db.estado
        }
      ]
    });

    const result = ventas.map(v => ({
      id_publicacion: v.publicacion.id_publicacion,
      id_venta: v.id_venta,
      nro_venta: v.nro_venta,
      cant: v.cantidad,
      total: v.costo,
      producto: v.publicacion.producto.nombre,
      costo: v.publicacion.costo,
      estado: v.estado.descripcion,
      img: v.publicacion.ruta_imagen,
      id_estado: v.id_estado,
      fecha_entrega: v.fecha_entrega
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});


app.get('/publicaciones/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const publicaciones = await db.publicacion.findAll({
        where: { id_vendedor: id },
        include: [
          {
            model: db.producto,
            include: [
              {
                model: db.categoria,
                as: 'categoria'
              }
            ]
          }
        ]
      });

    //console.log(JSON.stringify(publicaciones, null, 2));

    const result = publicaciones.map(p => ({
      id: p.id_publicacion,
      titulo: p.producto?.nombre,
      stock: p.stock,
      total: p.costo,
      categoria: p.producto?.categoria?.nombre_categoria,
      img: p.ruta_imagen,
      activa: p.activa,
      descripcion: p.breve_descripcion,
      id_categoria: p.producto?.categoria?.id_categoria,
      id_producto: p.producto?.id_producto
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});




// ========= postRefresh =========
app.post('/refresh', requiereLogin, async (req, res) => {
  const { id, email, id_rol } = req.user;

  const nuevoToken = generarToken({ id, email, ID_ROL: id_rol });

  // Actualizar token en la base (opcional)
  await db.usuario.update({ token: nuevoToken }, { where: { id_usuario: id } });

  res.json({ token: nuevoToken });
});


// ========= LISTEN SERVER =========
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
});

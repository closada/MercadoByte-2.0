const express = require('express')
const cors = require('cors');
const app = express()
const port = 3001
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize({
  storage: 'base_datos.db',
  dialect: 'sqlite',
  define: {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  },
});

const Carrera = sequelize.define('carreras', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "nombre" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "nombre" no puede estar vacío'
      }
    }
  },
  lugar: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "lugar" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "lugar" no puede estar vacío'
      }
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "fecha" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "fecha" no puede estar vacío'
      }
    }
  },
  vueltas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "vueltas" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "vueltas" no puede estar vacío'
      }
    }
  },
});

const Piloto = sequelize.define('pilotos', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "nombre" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "nombre" no puede estar vacío'
      }
    }
  },
  escuderia: {
    type: DataTypes.ENUM('Mercedes', 'McLaren', 'Red Bull', 'Aston Martin.', 'Ferrari'),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "escudería" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "escudería" no puede estar vacío'
      },
    }
  },
});

const Clasificacion = sequelize.define('clasificaciones', {}, { timestamps: false });

Carrera.belongsToMany(Piloto, { through: Clasificacion, as: 'pilotos'});
Piloto.belongsToMany(Carrera, { through: Clasificacion, as: 'carreras'});

app.use(cors());
app.use(bodyParser.json());

sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      popular();
      console.log('El servidor está corriendo en el puerto ' + port);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

//--------------------- EVENTOS ------------------------

app.get('/carreras', async (req, res) => {
  const data = await Carrera.findAll({
    attributes: {
      include: [[sequelize.fn("COUNT", sequelize.literal("DISTINCT pilotos.id")), "cantidadPilotos"]],
    },
    include: [
      {
        model: Piloto,
        as: 'pilotos',
        attributes: [],
        through: { attributes: [] },
      },
    ],
    group: ['carreras.id'],
  })
  res.json(data)
});

app.get('/carreras/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unCarrera = await Carrera.findByPk(id, {
      include: [
        {
          model: Piloto,
          as: 'pilotos',
          through: { attributes: [] },
        },
      ],
    });
    if (unCarrera === null) {
      res.status(404).json({ error: `No se encontró carrera con ID ${id}.` });
    } else {
      res.json(unCarrera);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }
});

app.post('/carreras/', async (req, res) => {
  try {
    const unCarrera = await Carrera.build(req.body)
    await unCarrera.validate()
    const unCarreraValidado = await Carrera.create(req.body)
    if (req.body.pilotos && req.body.pilotos.length > 0) {
      await unCarreraValidado.setPilotos(req.body.pilotos);
    }
    res.json({id: unCarreraValidado.id})
  } catch (error) {
    console.error(error);
    res.status(409).json({ error: error });
  }
});

app.patch('/carreras/:id', async (req, res) => {
  const { id } = req.params;
  const unCarrera = req.body;
  try {
    const [, affectedRows] = await Carrera.update(
      unCarrera,
      { where: { id } }
    );
    const unaCarrera = await Carrera.findByPk(id)
    if (req.body.pilotos && req.body.pilotos.length > 0) {
      await unaCarrera.setPilotos(req.body.pilotos);
    }
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró carrera con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
  }
});

app.delete('/carreras/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unCarrera = await Carrera.findOne({ where: { id } });
    if (!unCarrera) {
      return res.status(404).json({ error: `No se encontró carrera con ID ${id}.` });
    }
    await unCarrera.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//--------------------- INVITADOS ------------------------

app.get('/pilotos/', async (req, res) => {
  const { id } = req.params;
  try {
    const unPiloto = await Piloto.findAll()
    res.json(unPiloto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }
});

app.post('/pilotos', async (req, res) => {
  try {
    const unPiloto = await Piloto.build(req.body);
    await unPiloto.validate();
    const unPilotoValidado = await Piloto.create(req.body);
    res.json({id: unPilotoValidado.id});
  } catch (error) {
    console.error(error);
    res.status(409).json({ error: error });
  }
});

app.delete('/pilotos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unPiloto = await Piloto.findOne({ where: { id } });
    if (!unPiloto) {
      return res.status(404).json({ error: 'Piloto no encontrado' });
    }
    await unPiloto.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//-------------------------- BBDD ------------------------------

async function popular() {
  const qCarreras = await Carrera.count();
  const qPilotos = await Piloto.count();
  if(qCarreras==0 && qPilotos==0) {
    const carreras = [
      { nombre: "Gran Premio de España", lugar: "Catalunya", fecha: new Date("2024-07-15T15:00:00"), vueltas: 66 },
      { nombre: "Gran Premio de Francia", lugar: "Paul Ricard", fecha: new Date("2024-07-22T10:00:00"), vueltas: 53 },
      { nombre: "Gran Premio de Austria", lugar: "Red Bull Ring", fecha: new Date("2024-07-29T21:00:00"), vueltas: 71 },
      { nombre: "Gran Premio de Hungría", lugar: "Hungaroring", fecha: new Date("2024-08-12T11:00:00"), vueltas: 70 },
      { nombre: "Gran Premio de Italia", lugar: "Monza", fecha: new Date("2024-09-03T10:00:00"), vueltas: 53 },
      { nombre: "Gran Premio de Estados Unidos", lugar: "Circuit of The Americas", fecha: new Date("2024-10-15T11:30:00"), vueltas: 56 }
    ];
    const pilotos = [
      { nombre: "Carlos Sainz Jr.", escuderia: "Ferrari" },
      { nombre: "Charles Leclerc",  escuderia: "Ferrari" },
      { nombre: "Daniel Ricciardo", escuderia: "McLaren" },
      { nombre: "Esteban Ocon",     escuderia: "Alpine" },
      { nombre: "George Russell",   escuderia: "Mercedes" },
      { nombre: "Lando Norris",     escuderia: "McLaren" },
      { nombre: "Lewis Hamilton",   escuderia: "Mercedes" },
      { nombre: "Max Verstappen",   escuderia: "Red Bull" },
      { nombre: "Sergio Pérez",     escuderia: "Red Bull" },
      { nombre: "Valtteri Bottas",  escuderia: "Mercedes" },
    ];

    const contenedoresCreados = await Carrera.bulkCreate(carreras, { validate: true });
    const contenidosCreados = await Piloto.bulkCreate(pilotos, { validate: true });

    let qContenedores = contenedoresCreados.length;
    for (const contenido of contenidosCreados) {
      const contenedoresRandom = mezclarArreglo(contenedoresCreados);
      const asignables = contenedoresRandom.slice(Math.floor(Math.random() * qContenedores), Math.floor(Math.random() * qContenedores));
      await contenido.setCarreras(asignables);
    }
  }
}

function mezclarArreglo(arreglo)
{
  const mezclado = [...arreglo];
  const q = arreglo.length;
  for (let x = q*2; x >= 0; x--) {
    const j = Math.floor(Math.random() * q);
    const i = Math.floor(Math.random() * q);
    [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
  }
  return mezclado;
}

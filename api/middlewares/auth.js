const jwt = require('jsonwebtoken');
const SECRET = 'DayR7RxvEM4T4efkoEZBSVDjVqrmtdaQZHepj-D4L43GB7mzywkDtr7K-LpjvfKdRRGEqIcvYAPBjCVXñ.';

exports.generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id_usuario,          
      nombre: usuario.nombre,
      id_rol: usuario.ID_ROL,          
      rol: usuario.rol?.nombre_rol     
    },
    SECRET,
    { expiresIn: '2h' }                // JWT expira en 2 horas automáticamente
  );
};

exports.requiereLogin = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token no encontrado' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
};

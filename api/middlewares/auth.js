const jwt = require('jsonwebtoken');
const SECRET = 'DayR7RxvEM4T4efkoEZBSVDjVqrmtdaQZHepj-D4L43GB7mzywkDtr7K-LpjvfKdRRGEqIcvYAPBjCVXñ.';


exports.generarToken = (usuario) => {
  exports.generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      id_rol: usuario.ID_ROL   // asegúrate de que este campo exista
    },
    SECRET,
    { expiresIn: '2h' }
  );
};

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

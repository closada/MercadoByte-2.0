import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../styles/mispreguntas.css';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function MisPreguntas() {
  const { estaAutenticado, getUsuario, sesionCaducada } = useAuth();
  const [preguntas, setPreguntas] = useState([]);
  const [tienePreguntas, setTienePreguntas] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado()) {
      const idUsuario = getUsuario();
      traerMisPreguntas(idUsuario);
    } else {
      sesionCaducada();
    }
  }, []);

  const traerMisPreguntas = async (idUsuario) => {
    try {
      const res = await axios.get(`${API_URL}mispreguntas/${idUsuario}`);
      setPreguntas(res.data);
      setTienePreguntas(res.data.length > 0);
    } catch (err) {
      console.log(err);
    }
  };

  const VerPublicacion = (id) => {
    navigate(`/publicacion/${id}`);
  };

  return (
    <div className="container mt-2">
      {!tienePreguntas ? (
        <div className="mt-5">
          <h6>Aún no ha realizado ninguna pregunta.</h6>
        </div>
      ) : (
        <>
          <h2 className="mb-5">Mis Preguntas</h2>
          {preguntas.map((p, i) => (
            <div key={i} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-3 p-1" style={{ height: '200px' }}>
                  <img
                    src={p.imagen}
                    alt={p.id_publicacion}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title">{p.nombre_producto}</h5>
                      <button className="btn btn-outline-primary me-1" onClick={() => VerPublicacion(p.id_publicacion)}>
                        Ver publicación
                      </button>
                    </div>
                    <p className="card-text">
                      <b>Pregunta:</b> {p.pregunta} -{' '}
                      <small className="text-muted">
                        {new Date(p.fecha_pregunta).toLocaleDateString('es-AR')}
                      </small>
                    </p>
                    {p.respuesta === null ? (
                      <p className="card-text">
                        <small className="text-muted">Sin respuesta</small>
                      </p>
                    ) : (
                      <p className="card-text">
                        <b>Respuesta:</b> {p.respuesta} -{' '}
                        <small className="text-muted">
                          {new Date(p.fecha_respuesta).toLocaleDateString('es-AR')}
                        </small>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

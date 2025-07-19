import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

import '../styles/misrespuestas.css';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

import { useCart } from '../context/CartContext';

export default function MisRespuestas() {
  const { estaAutenticado, getUsuario, sesionCaducada } = useAuth();
  const [preguntas, setPreguntas] = useState([]);
  const [tienePreguntas, setTienePreguntas] = useState(false);
  const [editandoRespuesta, setEditandoRespuesta] = useState({});
  const [respuestas, setRespuestas] = useState({});
  const [modalOk, setModalOk] = useState(false);
  const [modalError, setModalError] = useState(false);

  const navigate = useNavigate();

  const { vaciarCarrito } = useCart();

  useEffect(() => {
    if (estaAutenticado()) {
      traerMisPreguntasVend();
    } else {
      vaciarCarrito();
      sesionCaducada();
    }
  }, []);

  const traerMisPreguntasVend = async () => {
    try {
      const res = await axios.get(`${API_URL}mispreguntasvend/${getUsuario()}`);
      setPreguntas(res.data);
      setTienePreguntas(res.data.length > 0);
    } catch (err) {
      console.error(err);
    }
  };

  const VerPublicacion = (id) => {
    navigate(`/publicacion/${id}`);
  };

  const EditarRespuesta = (id) => {
    setEditandoRespuesta((prev) => ({ ...prev, [id]: true }));
  };

  const Cancelar = (id) => {
    setEditandoRespuesta((prev) => ({ ...prev, [id]: false }));
    setRespuestas((prev) => ({ ...prev, [id]: '' }));
  };

  const handleTextareaChange = (id, value) => {
    setRespuestas((prev) => ({ ...prev, [id]: value }));
  };

  const EnviarRespuesta = async (id) => {
    if (!estaAutenticado()) {
      vaciarCarrito();
      sesionCaducada();
      return;
    }

    try {
      const datos = { id, respuesta: respuestas[id] };
      await axios.patch(`${API_URL}respuesta/${id}`, datos);
      setModalOk(true);
      setEditandoRespuesta((prev) => ({ ...prev, [id]: false }));
      setRespuestas((prev) => ({ ...prev, [id]: '' }));
      traerMisPreguntasVend();
    } catch (err) {
      console.error(err);
      setModalError(true);
    }
  };

  return (
    <div className="container mt-2">
      {!tienePreguntas ? (
        <div className="mt-5">
          <h6>Aún no han realizado preguntas a tus publicaciones.</h6>
        </div>
      ) : (
        <>
          <h2 className="mb-5">Mis Respuestas</h2>
          {preguntas.map((p) => (
            <div key={p.id} className="card mb-3">
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

                    {p.respuesta !== null && !editandoRespuesta[p.id] && (
                      <p className="card-text">
                        <b>Respuesta:</b> {p.respuesta} -{' '}
                        <small className="text-muted">
                          {new Date(p.fecha_respuesta).toLocaleDateString('es-AR')}
                        </small>{' '}
                        <button className="btn btn-link m-0 p-0" onClick={() => EditarRespuesta(p.id)}>
                          Editar respuesta
                        </button>
                      </p>
                    )}

                    {p.respuesta === null && !editandoRespuesta[p.id] && (
                      <p className="card-text">
                        <button className="btn btn-link m-0 p-0" onClick={() => EditarRespuesta(p.id)}>
                          Cargar respuesta
                        </button>
                      </p>
                    )}

                    {editandoRespuesta[p.id] && (
                      <div className="card-text mt-2">
                        <label htmlFor={`respuestatext${p.id}`}>Escriba su respuesta:</label>
                        <textarea
                          className="form-control"
                          id={`respuestatext${p.id}`}
                          rows="4"
                          value={respuestas[p.id] || ''}
                          onChange={(e) => handleTextareaChange(p.id, e.target.value)}
                        />
                        <div className="card-text">
                          <button
                            className="btn btn-success mt-3 me-2"
                            onClick={() => EnviarRespuesta(p.id)}
                            disabled={!respuestas[p.id]?.trim()}
                          >
                            Enviar
                          </button>
                          <button className="btn btn-link mt-3" onClick={() => Cancelar(p.id)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Modal OK */}
      <Modal show={modalOk} onHide={() => setModalOk(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualización correcta</Modal.Title>
        </Modal.Header>
        <Modal.Body>Los cambios se han guardado correctamente.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOk(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Error */}
      <Modal show={modalError} onHide={() => setModalError(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>Hubo un error inesperado.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalError(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

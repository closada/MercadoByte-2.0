import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

import '../styles/mispublicaciones.css';

export default function MisPublicaciones() {
  const { estaAutenticado, getUsuario, sesionCaducada } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [tienePublicaciones, setTienePublicaciones] = useState(false);
  const [modalOk, setModalOk] = useState(false);
  const [modalError, setModalError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado()) {
      traerMisPublicaciones();
    } else {
      sesionCaducada();
    }
  }, []);

  const traerMisPublicaciones = async () => {
    try {
      const res = await axios.get(`${API_URL}mispublicaciones/${getUsuario()}`);
      setPublicaciones(res.data);
      setTienePublicaciones(res.data.length > 0);
    } catch (err) {
      console.error(err);
    }
  };

  const CambiarEstado = async (id_publicacion) => {
    if (!estaAutenticado()) {
      sesionCaducada();
      return;
    }

    try {
      await axios.patch(`${API_URL}publicacionestado/${id_publicacion}`);
      setModalOk(true);
      traerMisPublicaciones();
    } catch (err) {
      console.error(err);
      setModalError(true);
    }
  };

  const VerPublicacion = (id) => {
    navigate(`/publicacion/${id}`);
  };

  return (
    <div className="container mt-2">
      {!tienePublicaciones ? (
        <div className="mt-5">
          <h6>No tienes publicaciones activas actualmente.</h6>
        </div>
      ) : (
        <>
          <h2 className="mb-5">Mis Publicaciones</h2>
          {publicaciones.map((p) => (
            <div key={p.id} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-3 p-1" style={{ height: '200px' }}>
                  <img
                    src={p.imagen}
                    alt={p.modelo}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title">{p.modelo}</h5>
                      <button className="btn btn-outline-primary me-1" onClick={() => VerPublicacion(p.id)}>
                        Ver publicación
                      </button>
                    </div>
                    <p className="card-text">
                      <b>Precio:</b> ${p.precio}
                    </p>
                    <p className="card-text">
                      <b>Fecha publicación:</b> {new Date(p.fecha_publicacion).toLocaleDateString('es-AR')}
                    </p>
                    <p className="card-text">
                      <b>Estado:</b> {p.estado === 1 ? 'Activo' : 'Finalizado'}
                    </p>
                    {p.estado === 1 && (
                      <button className="btn btn-danger mt-2" onClick={() => CambiarEstado(p.id)}>
                        Finalizar publicación
                      </button>
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
        <Modal.Body>La publicación fue finalizada correctamente.</Modal.Body>
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

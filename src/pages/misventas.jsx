import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

import '../styles/misventas.css';
import { API_URL } from '../config';
import { estaAutenticado, getUsuario, sesionCaducada } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function MisVentas() {
  const { estaAutenticado, getUsuario, sesionCaducada } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [tieneVentas, setTieneVentas] = useState(false);
  const [error, setError] = useState(false);
  const [showCambiosModal, setShowCambiosModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado()) {
      const idUsuario = getUsuario();
      traerVentas(idUsuario);
    } else {
      sesionCaducada();
    }
  }, []);

  const traerVentas = async (idUsuario) => {
    try {
      const res = await axios.get(`${API_URL}ventas/${idUsuario}`);
      setVentas(res.data);
      setTieneVentas(res.data.length > 0);
    } catch (err) {
      setError(true);
    }
  };

  const cambiarEstado = async (id_venta) => {
    if (!estaAutenticado()) {
      sesionCaducada();
      return;
    }

    try {
      await axios.patch(`${API_URL}estadoventa/${id_venta}`);
      setShowCambiosModal(true);
      traerVentas(getUsuario());
    } catch (err) {
      setError(true);
    }
  };

  const VerPublicacion = (id) => {
    navigate(`/publicacion/${id}`);
  };

  return (
    <div className="container mt-2">
      {!tieneVentas ? (
        <div className="mt-5">
          <h6>Aún no ha realizado ninguna venta.</h6>
        </div>
      ) : (
        <>
          <h2 className="mb-5">Mis Ventas</h2>
          {ventas.map((v, i) => (
            <div key={i} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-3 p-1" style={{ height: '200px' }}>
                  <img
                    src={v.img}
                    alt={v.nro_venta}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Nro de venta: {v.nro_venta}</small>
                      <button className="btn btn-outline-primary me-1" onClick={() => VerPublicacion(v.id_publicacion)}>
                        Ver publicación
                      </button>
                    </div>
                    <h5 className="card-title">{v.producto}</h5>
                    <p className="card-text">
                      (${v.costo?.toLocaleString('es-AR')} x {v.cant}): ${v.total?.toLocaleString('es-AR')}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">Estado: {v.estado}</small>
                    </p>
                    {v.estado === 'Pendiente' ? (
                      <p className="card-text">
                        <button className="btn btn-link m-0 p-0" onClick={() => cambiarEstado(v.id_venta)}>
                          Cambiar estado
                        </button>
                      </p>
                    ) : (
                      <p className="card-text">
                        Entregado el {new Date(v.fecha_entrega).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Modal de cambios OK */}
      <Modal show={showCambiosModal} onHide={() => setShowCambiosModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualización correcta</Modal.Title>
        </Modal.Header>
        <Modal.Body>Los cambios se han guardado correctamente.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCambiosModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

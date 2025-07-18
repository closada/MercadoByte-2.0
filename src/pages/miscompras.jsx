import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { estaAutenticado, getUsuario } from '../services/auth';
import '../styles/miscompras.css';

export default function MisCompras() {
  const [compras, setCompras] = useState([]);
  const [tieneCompras, setTieneCompras] = useState(false);
  const [modales, setModales] = useState({
    cambios: false,
    error: false,
    edit: false,
  });

  const [form, setForm] = useState({
    id_venta: null,
    puntaje: 1,
    comentario: '',
    id_opinion: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado()) {
      traerCompras();
    } else {
      navigate('/');
    }
  }, []);

  const traerCompras = async () => {
    try {
      const res = await api.get(`/compras/${getUsuario()}`);
      setCompras(res.data);
      setTieneCompras(res.data.length > 0);
    } catch {
      setModales((prev) => ({ ...prev, error: true }));
    }
  };

  const editarOpinion = (id_venta) => {
    const compra = compras.find((c) => c.id_venta === id_venta);
    if (compra) {
      setForm({
        id_venta: compra.id_venta,
        puntaje: compra.puntaje || 1,
        comentario: compra.comentario || '',
        id_opinion: compra.id_opinion,
      });
      setModales((prev) => ({ ...prev, edit: true }));
    }
  };

  const guardarOpinion = async () => {
    const body = { ...form };

    //para que envíe como numero
    body.puntaje = Number(body.puntaje);

    try {
      if (form.id_opinion === null) {
        await api.post('/opinion', body);
      } else {
        await api.patch(`/opinion/${form.id_venta}`, body);
      }
      setModales({ edit: false, cambios: true, error: false });
      traerCompras();
    } catch {
      setModales({ edit: false, cambios: false, error: true });
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-4">
      {!tieneCompras ? (
        <h6 className="mt-5">Aún no ha realizado ninguna compra.</h6>
      ) : (
        <>
          <h2 className="mb-5">Mis Compras</h2>
          {compras.map((c) => (
            <div className="card mb-3" key={c.id_venta}>
              <div className="row g-0">
                <div className="col-md-3 p-1" style={{ height: '200px' }}>
                  <img
                    src={c.img}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'contain' }}
                    alt={c.nro_venta}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Nro de venta: {c.nro_venta}</small>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(`/publicacion/${c.id_publicacion}`)}
                      >
                        Ver publicación
                      </button>
                    </div>
                    <div className="card-title d-flex align-items-center">
                      <h5>{c.producto}</h5>
                      {c.id_opinion !== null && (
                        <div className="ms-2">
                          {typeof c.puntaje === 'number' && c.puntaje >= 0 && c.puntaje <= 5 && (
                              <>
                                {[...Array(c.puntaje)].map((_, i) => (
                                  <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
                                ))}
                                {[...Array(5 - c.puntaje)].map((_, i) => (
                                  <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
                                ))}
                              </>
                            )}

                        </div>
                      )}
                    </div>
                    <p className="card-text">
                      (${c.costo} x {c.cant}): ${c.total}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">Estado: {c.estado}</small>
                    </p>
                    {c.estado !== 'Pendiente' && (
                      <p className="card-text">
                        <button
                          className="btn btn-link m-0 p-0"
                          onClick={() => editarOpinion(c.id_venta)}
                        >
                          Editar opinión
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Modal Editar Opinión */}
      <Modal show={modales.edit} onHide={() => setModales((prev) => ({ ...prev, edit: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Opinión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Puntaje (1 a 5)</Form.Label>
              <Form.Control
                type="number"
                name="puntaje"
                value={form.puntaje}
                onChange={handleInput}
                min={1}
                max={5}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Comentario (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                name="comentario"
                value={form.comentario}
                onChange={handleInput}
                rows={3}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModales((prev) => ({ ...prev, edit: false }))}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={guardarOpinion}
            disabled={!form.puntaje || form.puntaje < 1 || form.puntaje > 5}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Cambios OK */}
      <Modal show={modales.cambios} onHide={() => setModales((prev) => ({ ...prev, cambios: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Actualización correcta</Modal.Title>
        </Modal.Header>
        <Modal.Body>Los cambios se han guardado correctamente.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModales((prev) => ({ ...prev, cambios: false }))}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Error */}
      <Modal show={modales.error} onHide={() => setModales((prev) => ({ ...prev, error: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>Hubo un error inesperado.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModales((prev) => ({ ...prev, error: false }))}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

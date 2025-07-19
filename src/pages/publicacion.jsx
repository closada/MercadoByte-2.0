import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import '../styles/publicacion.css';
import { useNavigate } from 'react-router-dom';


import { API_URL } from '../config';

import { useAuth } from '../context/AuthContext';

import { useAuthModals } from '../context/AuthModalContext';
import LoginModal from '../components/LoginModal';
import ExpiredModal from '../components/ExpiredModal';



export default function Publicacion() {
  const { estaAutenticado, getUsuario } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cantComprar, setCantComprar] = useState(1);
  const [pregunta, setPregunta] = useState('');
  const [modales, setModales] = useState({
    compra: false,
    cambios: false,
    error: false,
    pregunta: false
  });


	const { isAuthenticated } = useAuth();

	const { showExpiredModal, setShowLoginModal, setShowExpiredModal } = useAuthModals();


	const [showPreguntaModal, setShowPreguntaModal] = useState(false);


  useEffect(() => {
    obtenerPublicacion(id);
  }, []);


useEffect(() => {
  if (isAuthenticated && showExpiredModal) {
    setShowExpiredModal(false);
    setShowPreguntaModal(true);
  }
}, [isAuthenticated]);

	const obtenerPublicacion = async (id) => {
	  try {
		const res = await axios.get(`${API_URL}publicacion/${id}`);
		setProducto(res.data);
	  } catch (err) {
		console.error(err);
	  }
	};


  const handleCantidad = (delta) => {
    setCantComprar((prev) => {
      const nueva = prev + delta;
      if (nueva < 1) return 1;
      if (nueva > producto.stock) return producto.stock;
      return nueva;
    });
  };
  
  const handlePreguntaClick = () => {
    if (!isAuthenticated) {
      setShowExpiredModal(true);
    } else {
      setShowPreguntaModal(true);
    }
  };



  const guardarPregunta = async () => {
    if (!estaAutenticado()) return;

    const body = {
      id_publicacion: parseInt(id),
      id_cliente: getUsuario(),
      pregunta
    };

    //console.log(body);

    try {
      await axios.post(`${API_URL}pregunta`, body);
	  setShowPreguntaModal(false);
      setModales({ ...modales, pregunta: false, cambios: true });
      setPregunta('');
      obtenerPublicacion(id);
    } catch (err) {
      setModales({ ...modales, error: true });
    }
  };

  const comprarProducto = async () => {
    if (estaAutenticado())
    {
      const fechaActual = new Date();
      const fechaVenta = fechaActual.toISOString().split('T')[0];
      const nroVenta = `V-${id}-${getUsuario()}-${fechaActual.getTime()}`;

      const body = {
        id_publicacion: parseInt(id),
        id_comprador: getUsuario(),
        cantidad: cantComprar,
        costo: producto.precio * cantComprar,
        fecha_venta: fechaVenta,
        nro_venta: nroVenta
      };

      //console.log(body);
      try {
        const res = await axios.post(`${API_URL}compra`, body);
        if (res.data.id > 0) {
          setModales({ ...modales, compra: true });
          // Redirigir a "Mis Compras"
          //navigate(`/miscompras`);
        }
      } catch (err) {
        console.error(err);
      }
      obtenerPublicacion(id);

    } else {
      setShowExpiredModal(true);
      return;
    }
  };

  if (!producto) return <div className="container">Cargando...</div>;

  return (
    <div className="container">
      {!producto.activa && (
        <div className="alert alert-danger">Publicación Suspendida.</div>
      )}
      {producto.activa && producto.stock === 0 ? (
          <div className="alert alert-danger">Publicación sin stock.</div>
        ) : null}


      {/* Producto */}
      <div className="card row d-flex flex-row border-0">
        <img
		  src={`/assets/img/${producto.img.split('/').pop()}`}
		  alt={producto.producto_nombre}
		  className="col-lg-4 p-5"
		  style={{ objectFit: 'contain', height: '500px' }}
		/>

        <div className="col-lg-8 card-body d-flex flex-column justify-content-center">
          <h6>{producto.ean}</h6>
          <h1>{producto.producto_nombre}</h1>
          <h2>${producto.precio?.toLocaleString('es-AR')}</h2>
          <strong className="mt-3">Stock disponible</strong>
          <div>{producto.stock} disponibles</div>

          {/* Controles */}
          <div className="mt-3 d-flex align-items-center">
            <div className="input-group me-3" style={{ maxWidth: '120px' }}>
              <button className="btn btn-outline-secondary" onClick={() => handleCantidad(-1)} disabled={!producto.activa || producto.stock === 0}>-</button>
              <input
                type="number"
                value={cantComprar}
                onChange={(e) => setCantComprar(parseInt(e.target.value))}
                onBlur={() => handleCantidad(0)} // valida cantidad
                className="form-control text-center"
                min={1}
                max={producto.stock}
                disabled={!producto.activa}
              />
              <button className="btn btn-outline-secondary" onClick={() => handleCantidad(1)} disabled={!producto.activa || producto.stock === 0}>+</button>
            </div>
            <button className="btn btn-lg botnaranja" onClick={comprarProducto} disabled={!producto.activa || producto.stock === 0}>
              Comprar ahora
            </button>
          </div>

        </div>
      </div>

      {/* Descripción */}
      <div className="card border-0 border-top">
        <div className="card-title"><h2>Descripción</h2></div>
        <div className="card-body p-0"><p>{producto.descripcion}</p></div>
      </div>

      {/* Opiniones */}
      {producto.opiniones?.length > 0 ? (
        <div className="card border-0 border-top">
          <div className="card-title"><h2>Opiniones</h2></div>
          <div className="card-body p-0">
            {producto.opiniones.map((o, index) => (
              <div key={index} className="card border-0 border-top bg-light mb-3">
                <div className="card-header d-flex align-items-center">
                  {[...Array(o.puntaje)].map((_, i) => (
                    <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
                  ))}
                  {[...Array(5 - o.puntaje)].map((_, i) => (
                    <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
                  ))}
                </div>
                {o.comentario && (
                  <div className="card-body">
                    <div className="card-text">{o.comentario}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card border-0 border-top">
          <div className="card-title"><h2>Opiniones</h2></div>
          <div className="card-body p-0"><p>Esta publicación aún no tiene opiniones.</p></div>
        </div>
      )}


      {/* Preguntas */}
      <div className="card border-0 border-top">
        <div className="card-title d-flex justify-content-between align-items-center">
          <h2>Preguntas</h2>
          <button className="btn btn-link" onClick={handlePreguntaClick} disabled={!producto.activa || producto.stock === 0}>
            Hacer una pregunta
          </button>
        </div>
        <div className="card-body p-0">
          {producto.preguntas_respuestas?.length > 0 ? (
            producto.preguntas_respuestas.map((p, i) => (
              <div key={i} className="card border-0 mb-3">
                <div className="d-flex align-items-center border-bottom">
                  <h5>{p.pregunta}</h5>
                  <small className="text-muted ms-2">{new Date(p.fecha_pregunta).toLocaleDateString()}</small>
                </div>
				{p.respuesta && (
                <div className="card-body">
                  {p.respuesta}
                  <small className="text-muted ms-2">{new Date(p.fecha_respuesta).toLocaleDateString()}</small>
                </div>
				)}
              </div>
            ))
          ) : <p>Esta publicación aún no tiene preguntas.</p>}
        </div>
      </div>

      {/* MODALES */}
     <Modal show={showPreguntaModal} onHide={() => setShowPreguntaModal(false)}>
	  <Modal.Header closeButton><Modal.Title>Pregunta</Modal.Title></Modal.Header>
	  <Modal.Body>
		<label htmlFor="pregunta">Escriba su pregunta:</label>
		<input className="form-control" type="text" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
	  </Modal.Body>
	  <Modal.Footer>
		<Button variant="secondary" onClick={() => setShowPreguntaModal(false)}>Cerrar</Button>
		<Button variant="primary" onClick={guardarPregunta} disabled={!pregunta}>Guardar</Button>
	  </Modal.Footer>
	</Modal>


      <Modal show={modales.cambios} onHide={() => setModales({ ...modales, cambios: false })}>
        <Modal.Header closeButton><Modal.Title>Actualización correcta</Modal.Title></Modal.Header>
        <Modal.Body>Los cambios se han guardado correctamente.</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setModales({ ...modales, cambios: false })}>Cerrar</Button></Modal.Footer>
      </Modal>

            <Modal show={modales.compra} onHide={() => {
        setModales({ ...modales, compra: false });
        navigate('/miscompras');
      }}>
        <Modal.Header closeButton><Modal.Title>Felicitaciones</Modal.Title></Modal.Header>
        <Modal.Body>¡Se ha procesado la compra correctamente! Podrá ver el detalle desde "Mis Compras".</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setModales({ ...modales, compra: false });
            navigate('/miscompras');
          }}>Cerrar</Button>
        </Modal.Footer>
      </Modal>


      <Modal show={modales.error} onHide={() => setModales({ ...modales, error: false })}>
        <Modal.Header closeButton><Modal.Title>Error</Modal.Title></Modal.Header>
        <Modal.Body>Hubo un error inesperado.</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setModales({ ...modales, error: false })}>Cerrar</Button></Modal.Footer>
      </Modal>
	  
		  <ExpiredModal
	  show={showExpiredModal}
	  onClose={() => {
		setShowExpiredModal(false);
		setShowLoginModal(true);
	  }}
	/>
    </div>
  );
}

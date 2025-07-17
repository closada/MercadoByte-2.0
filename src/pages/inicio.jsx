import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/inicio.css';

export default function Inicio() {
  const [publicaciones, setPublicaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPublicaciones();
  }, []);

  const obtenerPublicaciones = async () => {
    try {
      const res = await api.get('/publicaciones');
      setPublicaciones(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const verPublicacion = (id) => {
    navigate(`/publicacion/${id}`);
	
  };

  const getChunks = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i + 0, i + chunkSize));
    }
    return chunks;
  };

  return (
    <div className="container-fluid p-0 m-0">
      <div className="banner">
        <img src="/assets/img/banner3.png" alt="Banner principal" className="img-fluid w-100" />
      </div>

      <div className="container my-5">
        {publicaciones.map((categoria) => (
          categoria.productos && (
            <div key={categoria.id_categoria} className="mb-5">
              <h3 className="border-bottom pb-2">{categoria.categoria}</h3>

              <div id={`carousel${categoria.id_categoria}`} className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {getChunks(categoria.productos, 3).map((chunk, idx) => (
                    <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
                      <div className="row">
                        {chunk.map((producto) => (
                          <div className="col-md-4" key={producto.id_publicacion}>
                            <div className="card">
                              <div className="d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                                <img
                                  src={`/${producto.ruta_imagen}`}
                                  className="card-img-top w-100 h-100"
                                  style={{ objectFit: 'contain' }}
                                  alt={producto.modelo}
                                />
                              </div>
                              <div className="card-body text-center">
                                <h6 className="card-title text-truncate" style={{ fontSize: '0.9rem' }}>
                                  {producto.modelo}
                                </h6>
                                <p className="card-text mb-2" style={{ fontSize: '0.8rem' }}>
                                  {producto.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                </p>
                                <button className="btn btn-sm btn-primary" onClick={() => verPublicacion(producto.id_publicacion)}>
                                  Ver publicación
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target={`#carousel${categoria.id_categoria}`}
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Anterior</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target={`#carousel${categoria.id_categoria}`}
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Siguiente</span>
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

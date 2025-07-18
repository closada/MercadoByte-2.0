import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function Buscador() {
  const { texto } = useParams();
  const [publicaciones, setPublicaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (texto) {
      buscarTexto(texto);
    }
  }, [texto]);

  const buscarTexto = async (textoBuscado) => {
    try {
      const res = await axios.post(`${API_URL}buscador`, { texto: textoBuscado });
      console.log(res.data);
      setPublicaciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const verPublicacion = (id) => {
    navigate(`/publicacion/${id}`);
  };

  return (
    <div className="container my-5">
      {publicaciones.length === 0 ? (
        <div>No se encontraron publicaciones.</div>
      ) : (
        <div className="row">
          {publicaciones.map((p) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={p.id_publicacion}>
              <div className="card h-100">
                <div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                  <img
                    src={`/${p.ruta_imagen}`}
                    alt={p.modelo}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body text-center">
                  <h6 className="card-title text-truncate" style={{ fontSize: '0.9rem' }}>
                    {p.modelo}
                  </h6>
                  <p className="card-text mb-2" style={{ fontSize: '0.8rem' }}>
                    ${p.precio?.toLocaleString('es-AR')}
                  </p>
                  <button className="btn btn-sm btn-primary" onClick={() => verPublicacion(p.id_publicacion)}>
                    Ver publicación
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAuthModals } from '../context/AuthModalContext';
import api from '../services/api';
import '../styles/mispublicaciones.css';

import EditPubModal from '../components/EditPubModal';

import { useCart } from '../context/CartContext';


export default function MisPublicaciones() {
  const navigate = useNavigate();
  const { getUsuario, estaAutenticado, sesionCaducada } = useAuth();
  const { setShowExpiredModal } = useAuthModals();


  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);


  const [publicaciones, setPublicaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tienePublic, setTienePublic] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    titulo: '',
    stock: '',
    total: '',
    id_categoria: 0,
    categoria: '',
    img: null,
    activa: 1,
    descripcion: '',
    id_producto: 0,
    id_usuario: getUsuario(),
    imgbase64: '',
    imgnombre: ''
  });


  const { vaciarCarrito } = useCart();

  useEffect(() => {
    if (!estaAutenticado()) {
      vaciarCarrito();
      sesionCaducada();
      return;
    }
    traerPublicaciones();
    traerCategorias();
  }, []);

  const traerPublicaciones = async () => {
    try {
      const res = await api.get(`/publicaciones/${getUsuario()}`);
      setPublicaciones(res.data);
      setTienePublic(res.data.length > 0);
    } catch (e) {
      console.log(e);
    }
  };

  const traerCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const traerProductos = async (idCategoria) => {
    try {
      const res = await api.get(`/productos/${idCategoria}`);
      setProductos(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const onFileSelected = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imgnombre: file.name
      }));

      const reader = new FileReader();
      reader.onload = (ev) => {
        const binaryStr = ev.target.result;
        const base64 = btoa(binaryStr);
        setFormData(prev => ({ ...prev, imgbase64: base64 }));
        setImgPreview(URL.createObjectURL(file));
      };
      reader.readAsBinaryString(file);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    if (!estaAutenticado()) {
      vaciarCarrito();
      sesionCaducada();
      return;
    }

    try {
      await api.patch('/publicacion', {
        id_publicacion: id,
        nuevo_estado: nuevoEstado
      });
      setShowSuccessModal(true);
      traerPublicaciones();
    } catch (err) {
      setShowErrorModal(true);
    }
  };

  const editarPublicacion = (pub) => {
    setFormData({ ...pub, id_usuario: getUsuario() });
    setEsEdicion(true);
    setShowEditModal(true);

  };

  const agregarPublicacion = () => {
    setEsEdicion(false);
    setFormData({
      id: null,
      titulo: '',
      stock: '',
      total: '',
      id_categoria: 0,
      categoria: '',
      img: null,
      activa: 1,
      descripcion: '',
      id_producto: 0,
      id_usuario: getUsuario(),
      imgbase64: '',
      imgnombre: ''
    });
    setProductos([]);
    setShowEditModal(true);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = btoa(event.target.result);
        setFormData((prev) => ({
          ...prev,
          imgnombre: file.name,
          imgbase64: base64
        }));
      };
      reader.readAsBinaryString(file);
    }
  };

  const guardarPublicacion = async () => {
    try {
      if (!formData.id) {
        await api.post('/publicacion', formData);
      } else {
        formData.stock = Number(formData.stock);
        await api.patch(`/editpublicacion/${formData.id}`, formData);
      }
      setShowEditModal(false);
      setShowSuccessModal(true);
      traerPublicaciones();
    } catch (e) {
      setShowErrorModal(true);
    }
  };

  const verPublicacion = (id) => navigate(`/publicacion/${id}`);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-2">
      {!tienePublic && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h6>Aún no ha realizado ninguna publicación.</h6>
            <Button className="botnaranja" onClick={agregarPublicacion}>Nueva publicación</Button>
          </div>
        </div>
      )}

      {tienePublic && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h2>Mis publicaciones</h2>
            <Button className="botnaranja" onClick={agregarPublicacion}>Nueva publicación</Button>
          </div>

          {publicaciones.map((p) => (
            <div className="card mb-3" key={p.id}>
              <div className="row g-0">
                <div className="col-md-3 p-1" style={{ height: '200px' }}>
                  <img src={p.img} className="card-img-top w-100 h-100" style={{ objectFit: 'contain' }} alt={p.id} />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4>{p.titulo}</h4>
                      <Button variant="outline-primary" onClick={() => verPublicacion(p.id)}>Ver publicación</Button>
                    </div>
                    <p className="card-text"><small className="text-muted">Categoría: {p.categoria}</small></p>
                    <p className="card-text">Stock: {p.stock} | Precio: ${p.total}</p>
                    <p className="card-text">Estado: <em>{p.activa ? 'Activa' : 'Suspendida'}</em></p>
                    <div className="d-flex">
                      <Button variant="link" className="m-0 p-0" onClick={() => cambiarEstado(p.id, p.activa ? 0 : 1)}>
                        {p.activa ? 'Pausar publicación' : 'Activar publicación'}
                      </Button>
                      <Button variant="link" className="m-0 p-0 ms-3" onClick={() => editarPublicacion(p)}>Editar publicación</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* MODALES */}

      <EditPubModal
      show={showEditModal}
      onClose={() => setShowEditModal(false)}
      onSave={guardarPublicacion}
      esEdicion={esEdicion}
      categorias={categorias}
      productos={productos}
      traerProductos={traerProductos}
      formData={formData}
      setFormData={setFormData}
      onFileChange={onFileChange}
    />

    {/* Modal de éxito */}
    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Actualización correcta</Modal.Title>
      </Modal.Header>
      <Modal.Body>Los cambios se han guardado correctamente.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Modal de error */}
    <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>Hubo un error inesperado.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>


    </div>
  );
}

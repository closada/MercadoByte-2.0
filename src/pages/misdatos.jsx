import { useEffect, useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAuthModals } from '../context/AuthModalContext';
import '../styles/misdatos.css';
import { API_URL } from '../config';

export default function MisDatos() {
  const { getUsuario, estaAutenticado, sesionCaducada } = useAuth();
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    dni: '',
    email: '',
    domicilio: '',
    id_localidad: '',
    password: '',
  });
  const [localidades, setLocalidades] = useState([]);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const id = getUsuario();
    if (id !== false) {
      traerDatos(id);
      traerLocalidades();
    } else {
      sesionCaducada();
    }
  }, []);

  const adaptarDatos = (datos) => ({
    id: datos.id,
    nombre: datos.nombre,
    dni: datos.DNI,
    email: datos.EMAIL,
    domicilio: datos.DOMICILIO,
    id_localidad: datos.ID_LOCALIDAD,
    password: datos.PASSWORD,
  });

  const traerDatos = (id) => {
    axios.get(`${API_URL}misdatos/${id}`)
      .then((res) => {
        setFormData(adaptarDatos(res.data));
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  };

  const traerLocalidades = () => {
    axios.get(`${API_URL}localidades`)
      .then((res) => {
        setLocalidades(res.data);
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardar = () => {
    if (estaAutenticado()) {
      axios.patch(`${API_URL}usuario/${formData.id}`, formData)
        .then(() => {
          setShowModal(true); // mostrar modal de éxito
          traerDatos(formData.id);
          traerLocalidades();
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      sesionCaducada();
    }
  };

  return (
    <div className="container mt-2">
      <Form>
        <div className="mb-3 fs-3">
          <Form.Control plaintext readOnly name="nombre" value={formData.nombre} />
        </div>

        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">Documento</Form.Label>
          <div className="col-sm-10">
            <Form.Control plaintext readOnly name="dni" value={formData.dni} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">Email</Form.Label>
          <div className="col-sm-10">
            <Form.Control plaintext readOnly name="email" value={formData.email} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">Domicilio</Form.Label>
          <div className="col-sm-10">
            <Form.Control type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} />
          </div>
        </Form.Group>

        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">Localidad</Form.Label>
          <div className="col-sm-10">
            <Form.Select name="id_localidad" value={formData.id_localidad} onChange={handleChange}>
              {localidades.map((l) => (
                <option key={l.id_localidad} value={l.id_localidad}>{l.nombre_localidad}</option>
              ))}
            </Form.Select>
          </div>
        </Form.Group>

        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">Contraseña</Form.Label>
          <div className="col-sm-10">
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} />
          </div>
        </Form.Group>

        <Button variant="outline-primary" onClick={guardar} disabled={!formData.domicilio || !formData.password || !formData.id_localidad}>
          Guardar Cambios
        </Button>
      </Form>

      {/* MODAL de confirmación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Actualización correcta</Modal.Title>
        </Modal.Header>
        <Modal.Body>Se han guardado los cambios correctamente.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

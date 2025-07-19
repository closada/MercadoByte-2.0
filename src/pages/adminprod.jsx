import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import '../styles/adminprod.css';

function Adminprod() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [catselect, setCatselect] = useState(null);
  const [mostrarPublicaciones, setMostrarPublicaciones] = useState(false);
  const [showModalProd, setShowModalProd] = useState(false);
  const [showModalCat, setShowModalCat] = useState(false);
  const [showOkModal, setShowOkModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fraseError, setFraseError] = useState('');

  const [formProducto, setFormProducto] = useState({ id: null, nombre: '', ean: '', id_categoria: 0 });
  const [formCategoria, setFormCategoria] = useState({ id: null, categoria: '' });

  useEffect(() => {
    traerCategorias();
  }, []);

  const traerCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const traerProductos = async (cat) => {
    try {
      const res = await api.get('/productos/' + cat.id);
      setProductos(res.data);
      setMostrarPublicaciones(true);
      setCatselect(cat);
    } catch (error) {
      console.error(error);
    }
  };

  const guardarProducto = async () => {
    try {
      if (!formProducto.nombre || !formProducto.ean || formProducto.id_categoria < 1) return;

      if (formProducto.id === null) {
        await api.post('/producto', formProducto);
      } else {
        await api.patch('/producto/' + formProducto.id, formProducto);
      }

      setShowModalProd(false);
      setShowOkModal(true);
      resetTodo();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 409) {
        setFraseError(error.response?.data?.message || 'Error al guardar el producto');
        setShowErrorModal(true);
      }
    }
  };

  const guardarCategoria = async () => {
    try {
      if (!formCategoria.categoria) return;

      if (formCategoria.id === null) {
        await api.post('/categoria', formCategoria);
      } else {
        await api.patch('/categoria/' + formCategoria.id, formCategoria);
      }

      setShowModalCat(false);
      setShowOkModal(true);
      resetTodo();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 409) {
        setFraseError(error.response?.data?.message || 'Error al guardar la categoría');
        setShowErrorModal(true);
      }
    }
  };

  const resetTodo = () => {
    traerCategorias();
    setProductos([]);
    setCatselect(null);
    setMostrarPublicaciones(false);
    setFormProducto({ id: null, nombre: '', ean: '', id_categoria: 0 });
    setFormCategoria({ id: null, categoria: '' });
  };

  const eliminarProducto = async (id) => {
    try {
      await api.delete('/producto/' + id);
      setShowOkModal(true);
      resetTodo();
    } catch (error) {
      if (error.response?.status === 409) {
        setFraseError("No se puede eliminar el producto ya que posee publicaciones y/o ventas asociadas.");
        setShowErrorModal(true);
      }
    }
  };

  const eliminarCategoria = async () => {
    try {
      await api.delete('/categoria/' + catselect.id);
      setShowOkModal(true);
      resetTodo();
    } catch (error) {
      if (error.response?.status === 409) {
        setFraseError("No se puede eliminar la categoría ya que posee productos asociados.");
        setShowErrorModal(true);
      }
    }
  };

  return (
    <div className="container mt-2">
      <h3>Administrar productos</h3>

      <div className="d-flex p-2 align-items-center">
        <h5 className="mb-0">Categorias</h5>
        <Dropdown className="ms-auto">
          <Dropdown.Toggle variant="primary">+</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => { setFormCategoria({ id: null, categoria: '' }); setShowModalCat(true); }}>Agregar Categoría</Dropdown.Item>
            <Dropdown.Item onClick={() => { setFormProducto({ id: null, nombre: '', ean: '', id_categoria: 0 }); setShowModalProd(true); }}>Agregar Producto</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="d-flex p-2 justify-content-center flex-wrap">
        {categorias.map(c => (
          <div className="p-2 m-1" key={c.id}>
            <Button variant="light" onClick={() => traerProductos(c)}>{c.categoria}</Button>
          </div>
        ))}
      </div>

      {mostrarPublicaciones && (
        <div className="row mt-4">
          <div className="d-flex p-2">
            <div className="m-2">
              <Button variant="success" onClick={() => { setFormCategoria(catselect); setShowModalCat(true); }}>Editar Categoria</Button>
            </div>
            <div className="m-2">
              <Button variant="danger" onClick={eliminarCategoria}>Eliminar Categoria</Button>
            </div>
          </div>

          {productos.map(p => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" key={p.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title auto-font-size">{p.nombre}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{p.ean}</h6>
                  <Button variant="dark" onClick={() => { setFormProducto(p); setShowModalProd(true); }}>Editar</Button>{' '}
                  <Button variant="link" onClick={() => eliminarProducto(p.id)}>Eliminar</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Producto */}
      <Modal show={showModalProd} onHide={() => setShowModalProd(false)}>
        <Modal.Header closeButton><Modal.Title>Producto</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>EAN</Form.Label>
              <Form.Control type="text" value={formProducto.ean} onChange={e => setFormProducto({ ...formProducto, ean: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={formProducto.id_categoria} onChange={e => setFormProducto({ ...formProducto, id_categoria: parseInt(e.target.value) })}>
                <option value={0}>Seleccione una opción...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoria}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalProd(false)}>Cerrar</Button>
          <Button variant="primary" onClick={guardarProducto} disabled={!formProducto.nombre || !formProducto.ean || formProducto.id_categoria < 1}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Categoría */}
      <Modal show={showModalCat} onHide={() => setShowModalCat(false)}>
        <Modal.Header closeButton><Modal.Title>Categoría</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={formCategoria.categoria} onChange={e => setFormCategoria({ ...formCategoria, categoria: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalCat(false)}>Cerrar</Button>
          <Button variant="primary" onClick={guardarCategoria} disabled={!formCategoria.categoria}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal OK */}
      <Modal show={showOkModal} onHide={() => setShowOkModal(false)}>
        <Modal.Header closeButton><Modal.Title>Actualización correcta</Modal.Title></Modal.Header>
        <Modal.Body><p>Los cambios se han guardado correctamente.</p></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowOkModal(false)}>Cerrar</Button></Modal.Footer>
      </Modal>

      {/* Modal Error */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
        <Modal.Header closeButton><Modal.Title>Error</Modal.Title></Modal.Header>
        <Modal.Body><p>{fraseError}</p></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowErrorModal(false)}>Cerrar</Button></Modal.Footer>
      </Modal>
    </div>
  );
}

export default Adminprod;

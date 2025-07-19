import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_URL } from '../config';

import { useAuth } from '../context/AuthContext';

export default function Carrito() {
  const { carrito, quitarDelCarrito, vaciarCarrito } = useCart();
  const navigate = useNavigate();

  const { getUsuario } = useAuth();

  const [modales, setModales] = useState({
    compra: false,
    cambios: false,
    error: false,
    pregunta: false
  });


  const confirmarCompra = async () => {
    const fechaActual = new Date();
    const fechaVenta = fechaActual.toISOString().split('T')[0];
    const nroVenta = `V-CAR${getUsuario()}-${getUsuario()}-${fechaActual.getTime()}`;

    try {
      for (const item of carrito) {

        const body = {
        id_publicacion: item.id_publicacion,
        id_comprador: getUsuario(),
        cantidad: item.cantidad,
        costo: item.costo * item.cantidad,
        fecha_venta: fechaVenta,
        nro_venta: nroVenta
      };
        const res = await axios.post(`${API_URL}compra`, body);
      }
      vaciarCarrito();
      setModales({ ...modales, compra: true });
      //alert('¡Compra realizada con éxito!');

    } catch (error) {
      console.error('Error al comprar:', error);
      alert('Hubo un problema al procesar la compra.');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Carrito de Compras</h3>
      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="list-group mb-3">
            {carrito.map((item) => (
              <li key={item.id_publicacion} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{item.modelo}</strong><br />
                  Precio unitario: ${item.costo ? item.costo.toLocaleString() : 'N/A'}<br />
                  Subtotal: ${(item.costo && item.cantidad) ? (item.costo * item.cantidad).toLocaleString() : 'N/A'}<br />
                  Cantidad: {item.cantidad}<br />
                </div>
                <img src={`/${item.ruta_imagen}`} alt={item.modelo} style={{ width: '80px', height: 'auto' }} />
                <Button variant="danger" onClick={() => quitarDelCarrito(item.id_publicacion)}>
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
          <Button variant="success" onClick={confirmarCompra}>
            Confirmar Compra
          </Button>
        </>
      )}



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
    </div>
  );
}

import { Modal, Button, Form } from 'react-bootstrap';

export default function LoginModal({ show, onClose, email, setEmail, clave, setClave, login, error, setError }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={login}>
        <Modal.Header closeButton>
          <Modal.Title>Iniciar Sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(false);
              }}
              placeholder="Escriba su email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="clave">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={clave}
              onChange={(e) => {
                setClave(e.target.value);
                setError(false);
              }}
              placeholder="Escriba su contraseña"
              required
            />
          </Form.Group>

          {error && <div className="text-danger">Las credenciales ingresadas son incorrectas</div>}
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column">
          <Button variant="primary" type="submit" className="w-100 mb-2">Iniciar Sesión</Button>
          <Button variant="secondary" onClick={onClose} className="w-100">Cerrar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

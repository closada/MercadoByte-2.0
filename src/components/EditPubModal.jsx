import { Modal, Button, Form } from 'react-bootstrap';

export default function EditPubModal({
  show,
  onClose,
  onSave,
  esEdicion,
  categorias,
  productos,
  traerProductos,
  formData,
  setFormData,
  onFileChange
}) {
  if (!formData) return null;

  const setFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Publicación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Categoría */}
          {esEdicion ? (
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                plaintext
                readOnly
                value={formData.categoria || ''}
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={formData.id_categoria ?? 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormField('id_categoria', value);
                  traerProductos(value);
                }}
              >
                <option value={0}>Seleccione una opción...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoria}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Producto */}
          {esEdicion ? (
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                plaintext
                readOnly
                value={formData.titulo || ''}
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                value={formData.id_producto ?? 0}
                onChange={(e) => setFormField('id_producto', parseInt(e.target.value))}
              >
                <option value={0}>Seleccione una opción...</option>
                {productos.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Stock */}
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              value={formData.stock ?? ''}
              onChange={(e) => setFormField('stock', e.target.value)}
              required
              min={1}
            />
          </Form.Group>

          {/* Precio */}
          <Form.Group className="mb-3">
            <Form.Label>Precio del producto</Form.Label>
            <Form.Control
              type="number"
              value={formData.total ?? ''}
              onChange={(e) => setFormField('total', e.target.value)}
              required
              min={1}
            />
          </Form.Group>

          {/* Descripción */}
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.descripcion ?? ''}
              onChange={(e) => setFormField('descripcion', e.target.value)}
            />
          </Form.Group>

          {/* Imagen */}
          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={
            !formData.stock ||
            !formData.total ||
            (!esEdicion &&
              (!formData.id_categoria || !formData.id_producto))
          }
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

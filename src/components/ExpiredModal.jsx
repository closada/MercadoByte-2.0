export default function ExpiredModal() {
  return (
    <div className="modal fade" id="caducadoModal" tabIndex="-1" aria-labelledby="caducadoModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="caducadoModalLabel">Error</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
          </div>
          <div className="modal-body">
            <p>Debe iniciar sesión para poder continuar.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

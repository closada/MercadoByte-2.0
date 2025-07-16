export default function LoginModal({ email, setEmail, clave, setClave, login, error, setError }) {
  return (
    <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={login}>
            <div className="modal-header">
              <h5 className="modal-title" id="loginModalLabel">Iniciar Sesión</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email"
                  value={email} onChange={e => { setEmail(e.target.value); setError(false); }}
                  placeholder="Escriba su email" required />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="password"
                  value={clave} onChange={e => { setClave(e.target.value); setError(false); }}
                  placeholder="Escriba su contraseña" required />
              </div>
              {error && <small className="text-danger">Las credenciales ingresadas son incorrectas</small>}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
              <button type="button" className="btn btn-secondary mt-2" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

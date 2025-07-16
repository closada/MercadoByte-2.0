/* ----------------------------------------
 *  services/auth.js
 *  Helpers genéricos para trabajar con JWT
 * ---------------------------------------*/

/**
 * Devuelve el payload decodificado del JWT
 * o null si no existe / es inválido.
 */
export function getPayload() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/** ID del usuario logueado, o false si no hay sesión */
export function getUsuario() {
  const payload = getPayload();
  return payload?.id ?? false;
}

/** ID del rol (número entero) o -1 si no hay sesión */
export function getRol() {
  const payload = getPayload();
  return payload?.id_rol ?? -1;
}

/** Retorna true si el token existe y no venció */
export function estaAutenticado() {
  const payload = getPayload();
  if (!payload) return false;
  const ahora = Math.floor(Date.now() / 1000);
  return payload.exp > ahora;
}

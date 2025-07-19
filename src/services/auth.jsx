import axios from 'axios';
import { API_URL } from '../config';

/** Devuelve el payload decodificado del JWT o null si no existe / es inválido. */
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

/** Elimina el token, cierra sesión en el backend y redirige a inicio */
export async function logout(navigate) {
  const id_usuario = getUsuario();
  try {
    await axios.patch(`${API_URL}logout`, { id_usuario });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    localStorage.removeItem('jwt_token');
    navigate('/');
    window.location.reload();
  }
}

/** Fuerza cierre de sesión y muestra modal de sesión caducada */
export function sesionCaducada(setShowExpiredModal, logoutHandler) {
  if (typeof setShowExpiredModal === 'function') {
    setShowExpiredModal(true); // para usar con context
  }
  if (typeof logoutHandler === 'function') {
    logoutHandler(); // para uso en un AuthContext, si lo tenés
  } else {
    localStorage.removeItem('jwt_token');
  }
}

/**
 * Redirecciona a una pantalla según el rol y título (clasi),
 * si el usuario tiene permiso. Usa navigate (de react-router-dom).
 */
export async function getPantalla(clasi, navigate) {
  if (!estaAutenticado()) {
    navigate('/');
    return;
  }

  try {
    const idRol = getRol();
    const res = await axios.get(`${API_URL}menu/${idRol}`);
    const pantalla = res.data.find((item) => item.titulo === clasi);
    if (pantalla) {
      navigate(pantalla.accion);
    }
  } catch (error) {
    console.error('Error al obtener pantalla:', error);
  }
}

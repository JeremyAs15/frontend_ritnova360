/**
 * Extrae y decodifica el payload de un JWT.
 * Retorna `null` si el token no existe o no se puede parsear.
 */
export function getTokenPayload(token) {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Obtiene el rol del usuario desde un JWT.
 * Soporta distintas claves según cómo lo exponga el backend.
 */
export function getUserRoleFromToken(token) {
  const payload = getTokenPayload(token);
  return payload?.role || payload?.user_role || null;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('first_name');
  localStorage.removeItem('role');
  
  window.dispatchEvent(new Event('auth-change'));
  window.location.href = '/login';
}
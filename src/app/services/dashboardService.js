/**
 * Fuente de datos del dashboard.
 *
 * ACTIVO AHORA MISMO: fetch real contra el backend (GET /api/academy/dashboard/).
 *
 * =====================================================================
 * PARA VOLVER A LOS DATOS FALSOS (mock) si el backend no está disponible:
 *   1. Comenta/borra el bloque "FETCH REAL ACTIVO" de abajo.
 *   2. Descomenta el bloque "MOCK" que está debajo de este comentario.
 * Ambos exponen la misma firma: getDashboardData(role, { fechaInicio, fechaFin }).
 * El backend ya implementa este endpoint (academy/views.py → DashboardView) y
 * devuelve exactamente la misma forma que usa src/data/mockDashboard.js, así
 * que no hace falta tocar ningún componente de gráfico al cambiar la fuente.
 * =====================================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function getDashboardData(role, { fechaInicio, fechaFin } = {}) {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams();
  if (fechaInicio) params.set('fecha_inicio', fechaInicio); // formato YYYY-MM-DD
  if (fechaFin) params.set('fecha_fin', fechaFin);

  const response = await fetch(`${API_BASE_URL}/api/academy/dashboard/?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'No se pudo cargar la información del dashboard.');
  }

  return response.json();
}

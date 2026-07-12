function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Calcula { fechaInicio, fechaFin } en formato YYYY-MM-DD para un rango relativo a hoy. */
export function computeRange(days) {
  const fechaFin = new Date();
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - days);
  return { fechaInicio: toIsoDate(fechaInicio), fechaFin: toIsoDate(fechaFin) };
}

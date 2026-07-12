/**
 * Paleta de colores para los gráficos del dashboard (ApexCharts).
 * Debe mantenerse sincronizada con las variables --chart-* de src/app/styles/variables.css.
 * Naranja de marca como color dominante + tonos neutros. Sin rosa.
 */
export const CHART_PRIMARY = '#f97316';
export const CHART_PRIMARY_SOFT = '#fed7aa';
export const CHART_AMBER = '#d97706';
export const CHART_SLATE = '#94a3b8';
export const CHART_STONE = '#78716c';
export const CHART_STONE_DARK = '#57534e';
export const CHART_NEUTRAL_LIGHT = '#cbd5e1';
export const CHART_GRID_LINE = '#e5e7eb';

/** Paleta categórica ordenada, para donuts/series múltiples (géneros, etc). */
export const CHART_CATEGORICAL = [
  CHART_PRIMARY,
  CHART_AMBER,
  CHART_SLATE,
  CHART_STONE,
  CHART_STONE_DARK,
  CHART_NEUTRAL_LIGHT,
];

import { CHART_GRID_LINE } from '../../utils/chartColors';

/** Opciones base de ApexCharts compartidas por todos los gráficos del dashboard. */
export const baseChartOptions = {
  chart: {
    fontFamily: 'Anuphan, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  grid: {
    borderColor: CHART_GRID_LINE,
    strokeDashArray: 4,
  },
  tooltip: {
    theme: 'light',
  },
  dataLabels: {
    enabled: false,
  },
};

/** Formatea un número como moneda colombiana compacta (ej. 8.7M). */
export function formatCurrencyCompact(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatCurrencyFull(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

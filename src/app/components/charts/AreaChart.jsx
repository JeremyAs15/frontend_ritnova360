import Chart from 'react-apexcharts';
import { CHART_PRIMARY } from '../../utils/chartColors';
import { baseChartOptions } from './chartTheme';

/**
 * Gráfico de área con degradado, para series temporales de una sola métrica
 * (ingresos por mes, progreso semanal, etc).
 */
function AreaChart({ categories, series, height = 260, color = CHART_PRIMARY, valueFormatter }) {
  const options = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'area' },
    colors: [color],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: categories.length > 8 ? 8 : undefined,
      labels: {
        style: { colors: '#6b7280', fontSize: '12px' },
        rotate: categories.length > 8 ? -45 : 0,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontSize: '12px' },
        formatter: valueFormatter,
      },
    },
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: valueFormatter },
    },
  };

  return <Chart options={options} series={series} type="area" height={height} />;
}

export default AreaChart;

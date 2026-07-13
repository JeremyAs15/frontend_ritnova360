import Chart from 'react-apexcharts';
import { CHART_PRIMARY } from '../../utils/chartColors';
import { baseChartOptions } from './chartTheme';

/** Barras verticales, para series temporales categóricas (ej. ventas por mes). */
function BarChart({ categories, series, height = 260, color = CHART_PRIMARY, valueFormatter }) {
  const options = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    colors: [color],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '45%' },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#6b7280', fontSize: '12px' } },
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

  return <Chart options={options} series={series} type="bar" height={height} />;
}

export default BarChart;

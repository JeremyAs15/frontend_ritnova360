import Chart from 'react-apexcharts';
import { CHART_PRIMARY, CHART_PRIMARY_SOFT } from '../../utils/chartColors';
import { baseChartOptions } from './chartTheme';

/** Barras horizontales, para rankings (ej. top coreografías por ventas). */
function HorizontalBarChart({ categories, series, height = 260 }) {
  const options = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    colors: [CHART_PRIMARY],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '55%',
        distributed: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: { gradientToColors: [CHART_PRIMARY_SOFT], shadeIntensity: 1, type: 'horizontal' },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#6b7280', fontSize: '12px' } },
    },
    yaxis: {
      labels: { style: { colors: '#374151', fontSize: '13px' } },
    },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
}

export default HorizontalBarChart;

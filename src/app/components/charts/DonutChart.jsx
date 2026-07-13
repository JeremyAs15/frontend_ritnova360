import Chart from 'react-apexcharts';
import { CHART_CATEGORICAL } from '../../utils/chartColors';
import { baseChartOptions } from './chartTheme';

/** Donut con leyenda lateral, para distribuciones por categoría (ej. ventas por género). */
function DonutChart({ labels, series, height = 260 }) {
  const options = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels,
    colors: CHART_CATEGORICAL,
    stroke: { width: 2, colors: ['#fff'] },
    legend: {
      position: 'right',
      fontSize: '13px',
      markers: { size: 8 },
      itemMargin: { vertical: 4 },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '13px',
              color: '#6b7280',
            },
          },
        },
      },
    },
  };

  return <Chart options={options} series={series} type="donut" height={height} />;
}

export default DonutChart;

import Chart from 'react-apexcharts';
import { CHART_PRIMARY, CHART_NEUTRAL_LIGHT } from '../../utils/chartColors';

/**
 * Medidor semicircular (radialBar), para una única métrica 0–100 con valor
 * central legible (ej. rating sobre 5, % completado).
 */
function GaugeChart({ percentage, displayValue, height = 200, color = CHART_PRIMARY }) {
  const options = {
    chart: { type: 'radialBar', fontFamily: 'Anuphan, sans-serif' },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '65%' },
        track: { background: CHART_NEUTRAL_LIGHT, strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -2,
            fontSize: '26px',
            fontWeight: 700,
            color: '#111827',
            formatter: () => displayValue,
          },
        },
      },
    },
    fill: { colors: [color] },
    stroke: { lineCap: 'round' },
  };

  return <Chart options={options} series={[percentage]} type="radialBar" height={height} />;
}

export default GaugeChart;

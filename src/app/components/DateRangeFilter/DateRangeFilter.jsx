import { computeRange } from '../../utils/dateRange';
import './DateRangeFilter.css';

const RANGES = [
  { key: '30d', label: '30 días', days: 30 },
  { key: '90d', label: '90 días', days: 90 },
  { key: '6m', label: '6 meses', days: 180 },
  { key: '1y', label: '1 año', days: 365 },
];

/**
 * Filtro rápido de rango de fechas para los gráficos temporales del dashboard.
 * onChange recibe { key, fechaInicio, fechaFin }.
 */
function DateRangeFilter({ value = '6m', onChange }) {
  return (
    <div className="date-range-filter" role="tablist" aria-label="Rango de fechas">
      {RANGES.map(({ key, label, days }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          className={`date-range-filter__btn ${value === key ? 'date-range-filter__btn--active' : ''}`}
          onClick={() => onChange?.({ key, ...computeRange(days) })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default DateRangeFilter;

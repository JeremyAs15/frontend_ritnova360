import './StatCard.css';

/**
 * Tarjeta de indicador (KPI) del dashboard.
 */
function StatCard({ icon: Icon, label, value }) {
  const displayValue = value === null || value === undefined || value === '' ? '—' : value;

  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-card__icon">
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{displayValue}</p>
    </div>
  );
}

export default StatCard;

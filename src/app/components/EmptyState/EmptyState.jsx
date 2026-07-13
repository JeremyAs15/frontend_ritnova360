import './EmptyState.css';

/**
 * Estado vacío reutilizable para tarjetas y gráficos del dashboard sin datos aún.
 */
function EmptyState({ icon: Icon, title, description, height = 220 }) {
  return (
    <div className="empty-state" style={{ minHeight: height }}>
      {Icon && (
        <div className="empty-state__icon">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  );
}

export default EmptyState;

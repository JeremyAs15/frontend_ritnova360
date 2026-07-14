import { Music2, ShoppingBag, BarChart3, Star } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';
import DateRangeFilter from '../../components/DateRangeFilter/DateRangeFilter';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';

const RATING_MAX = 5;

/**
 * Dashboard de Profesor.
 * A propósito NO incluye ninguna tarjeta ni métrica de ingresos: el backend
 * (academy/services.py) tampoco expone ese dato para este rol.
 */
function TeacherDashboard({ data, loading, range, onRangeChange }) {
  if (!data) {
    return <Loader label="Cargando indicadores..." />;
  }

  const { kpis, ventas_por_mes: ventasPorMes } = data;
  const tieneVentas = ventasPorMes?.series?.[0]?.data?.some((v) => v > 0);
  const tieneRating = kpis.rating_promedio !== null && kpis.rating_promedio !== undefined;

  return (
    <div className={loading ? 'dashboard-refreshing' : undefined}>
      <div className="dashboard-kpi-grid">
        <StatCard icon={Music2} label="Mis coreografías" value={kpis.mis_coreografias} />
        <StatCard icon={ShoppingBag} label="Ventas del mes" value={kpis.ventas_mes} />
      </div>

      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Ventas por mes</h2>
            <DateRangeFilter value={range?.key} onChange={onRangeChange} />
          </div>
          {tieneVentas ? (
            <BarChart categories={ventasPorMes.categories} series={ventasPorMes.series} />
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Todavía no tienes ventas en este rango"
              description="Cuando los estudiantes se inscriban a tus coreografías, verás la tendencia aquí."
            />
          )}
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Rating promedio</h2>
          </div>
          {tieneRating ? (
            <>
              <GaugeChart
                percentage={(kpis.rating_promedio / RATING_MAX) * 100}
                displayValue={kpis.rating_promedio.toFixed(1)}
              />
              <p className="dashboard-gauge-caption">Sobre {RATING_MAX} estrellas, según las calificaciones de tus estudiantes</p>
            </>
          ) : (
            <EmptyState
              icon={Star}
              title="Sin calificaciones todavía"
              description="Cuando tus estudiantes califiquen tus coreografías, verás tu rating aquí."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;

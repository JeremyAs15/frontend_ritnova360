import { Users, Music2, ShoppingBag, TrendingUp, PieChart, Trophy } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';
import DateRangeFilter from '../../components/DateRangeFilter/DateRangeFilter';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import { formatCurrencyCompact, formatCurrencyFull } from '../../components/charts/chartTheme';

/** Dashboard de Administrador y Director (misma vista, mismos datos del backend). */
function AdminDirectorDashboard({ data, loading, range, onRangeChange }) {
  if (!data) {
    return <Loader label="Cargando indicadores..." />;
  }

  const { kpis, ingresos_por_mes: ingresosPorMes, ventas_por_genero: ventasPorGenero, top_coreografias: topCoreografias } = data;

  const tieneIngresos = ingresosPorMes?.series?.[0]?.data?.some((v) => v > 0);
  const tieneGeneros = ventasPorGenero?.labels?.length > 0;
  const tieneTop = topCoreografias?.categories?.length > 0;

  return (
    <div className={loading ? 'dashboard-refreshing' : undefined}>
      <div className="dashboard-kpi-grid">
        <StatCard icon={Users} label="Usuarios internos" value={kpis.usuarios_internos} />
        <StatCard icon={Music2} label="Coreografías" value={kpis.total_coreografias} />
        <StatCard icon={ShoppingBag} label="Ventas del mes" value={kpis.ventas_mes} />
        <StatCard icon={TrendingUp} label="Ingresos del mes" value={formatCurrencyFull(kpis.ingresos_mes)} />
      </div>

      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Ingresos por mes</h2>
            <DateRangeFilter value={range?.key} onChange={onRangeChange} />
          </div>
          {tieneIngresos ? (
            <AreaChart
              categories={ingresosPorMes.categories}
              series={ingresosPorMes.series}
              valueFormatter={formatCurrencyCompact}
            />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Todavía no hay ingresos en este rango"
              description="Cuando se registren ventas completadas, verás la tendencia aquí."
            />
          )}
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Ventas por género</h2>
          </div>
          {tieneGeneros ? (
            <DonutChart labels={ventasPorGenero.labels} series={ventasPorGenero.series} />
          ) : (
            <EmptyState
              icon={PieChart}
              title="Sin ventas registradas"
              description="La distribución por género aparecerá cuando haya inscripciones activas."
            />
          )}
        </div>
      </div>

      <div className="dashboard-chart-card">
        <div className="dashboard-chart-card__header">
          <h2 className="dashboard-chart-card__title">Top coreografías</h2>
        </div>
        {tieneTop ? (
          <HorizontalBarChart categories={topCoreografias.categories} series={topCoreografias.series} />
        ) : (
          <EmptyState
            icon={Trophy}
            title="Aún no hay coreografías con ventas"
            description="El ranking se llenará a medida que los estudiantes se inscriban."
          />
        )}
      </div>
    </div>
  );
}

export default AdminDirectorDashboard;

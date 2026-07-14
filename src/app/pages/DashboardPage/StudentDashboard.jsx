import { ShoppingBag, PlayCircle, Layers, Star, TrendingUp, Sparkles, PieChart } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import GaugeChart from '../../components/charts/GaugeChart';
import DonutChart from '../../components/charts/DonutChart';
import DateRangeFilter from '../../components/DateRangeFilter/DateRangeFilter';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import { CHART_PRIMARY } from '../../utils/chartColors';

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const RATING_MAX = 5;

/** Formato compacto "26 Abr" (sin "de"), para que quepan varias semanas sin solaparse. */
function formatWeekLabel(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]}`;
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

/** Dashboard de Estudiante (Cliente). */
function StudentDashboard({ data, loading, range, onRangeChange }) {
  if (!data) {
    return <Loader label="Cargando tu progreso..." />;
  }

  const { kpis, progreso_semanal: progresoSemanal, generos_comprados: generosComprados, recomendaciones } = data;

  const tieneProgreso = progresoSemanal?.length > 0;
  const tieneRecomendaciones = recomendaciones?.length > 0;
  const tieneRating = kpis.mi_rating_promedio !== null && kpis.mi_rating_promedio !== undefined;
  const tieneGeneros = generosComprados?.labels?.length > 0;

  const progresoChart = tieneProgreso
    ? {
        categories: progresoSemanal.map((p) => formatWeekLabel(p.semana)),
        series: [{ name: 'Videos vistos', data: progresoSemanal.map((p) => p.cantidad) }],
      }
    : null;

  return (
    <div className={loading ? 'dashboard-refreshing' : undefined}>
      <div className="dashboard-kpi-grid">
        <StatCard icon={ShoppingBag} label="Coreografías compradas" value={kpis.coreografias_compradas} />
        <StatCard icon={PlayCircle} label="Videos vistos" value={kpis.videos_vistos} />
        <StatCard icon={Layers} label="Géneros explorados" value={kpis.generos_explorados} />
      </div>

      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Tu progreso semanal</h2>
            <DateRangeFilter value={range?.key} onChange={onRangeChange} />
          </div>
          {progresoChart ? (
            <AreaChart categories={progresoChart.categories} series={progresoChart.series} color={CHART_PRIMARY} />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Aún no has visto clases en este rango"
              description="Empieza a ver videos de tus coreografías compradas y tu progreso aparecerá aquí."
            />
          )}
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Mis reseñas</h2>
          </div>
          {tieneRating ? (
            <>
              <GaugeChart
                percentage={(kpis.mi_rating_promedio / RATING_MAX) * 100}
                displayValue={kpis.mi_rating_promedio.toFixed(1)}
              />
              <p className="dashboard-gauge-caption">Promedio de estrellas que le has dado a tus coreografías</p>
            </>
          ) : (
            <EmptyState
              icon={Star}
              title="Aún no has calificado nada"
              description="Califica las coreografías que compraste para ver aquí el promedio de tus reseñas."
            />
          )}
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Recomendado para ti</h2>
          </div>
          {tieneRecomendaciones ? (
            <ul className="dashboard-list">
              {recomendaciones.map((rec) => (
                <li key={rec.choreography_id} className="dashboard-list-item">
                  <div>
                    <p className="dashboard-list-item__name">{rec.nombre}</p>
                    <p className="dashboard-list-item__meta">
                      {rec.genero}
                      {rec.profesor ? ` · ${rec.profesor}` : ''}
                    </p>
                  </div>
                  <span className="dashboard-list-item__price">{formatPrice(rec.precio)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No hay nuevas recomendaciones"
              description="Ya exploraste todo el catálogo disponible para tus géneros favoritos."
            />
          )}
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h2 className="dashboard-chart-card__title">Géneros que has comprado</h2>
          </div>
          {tieneGeneros ? (
            <DonutChart labels={generosComprados.labels} series={generosComprados.series} />
          ) : (
            <EmptyState
              icon={PieChart}
              title="Aún no has comprado coreografías"
              description="Cuando compres coreografías, verás aquí la distribución por género."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;

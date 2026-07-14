import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, AlertCircle, Play } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import './MyPurchasesPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LEVEL_LABELS = {
  Principiante: 'Principiante',
  Intermedio: 'Intermedio',
  Avanzado: 'Avanzado',
  'Todos los niveles': 'Todos los niveles',
};

const FALLBACK_IMAGE = '/logoIcono.png';

function MyPurchasesPage() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;

    const res = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  }, []);

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  }, [navigate]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No hay sesión activa.');

    const doRequest = (t) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${t}`,
        },
      });

    let response = await doRequest(token);
    if (response.status !== 401) return response;

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      redirectToLogin();
      throw new Error('Sesión expirada.');
    }

    response = await doRequest(refreshed);
    if (response.status === 401) {
      redirectToLogin();
      throw new Error('Sesión expirada.');
    }

    return response;
  }, [redirectToLogin, refreshAccessToken]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    const loadProfileAndPurchases = async () => {
      try {
        const profileRes = await fetchWithAuth(`${API_BASE_URL}/api/users/profile/`);
        if (!profileRes.ok) throw new Error('No se pudo cargar tu perfil.');
        const profileData = await profileRes.json();
        if (cancelled) return;
        setProfile(profileData);

        const purchasesRes = await fetchWithAuth(`${API_BASE_URL}/api/academy/my-courses/`);
        if (!purchasesRes.ok) throw new Error('No se pudieron cargar tus compras.');
        const purchasesData = await purchasesRes.json();
        if (cancelled) return;

        const enriched = (purchasesData || []).map((item) => ({
          ...item,
          image: item.thumbnail_url || FALLBACK_IMAGE,
          priceFormatted: item.price
            ? Number(item.price).toLocaleString('es-CO')
            : '0',
        }));

        setPurchases(enriched);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfileAndPurchases();

    return () => {
      cancelled = true;
    };
  }, [navigate, fetchWithAuth]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fallbackSidebar = getSidebarConfigForRole('student');
  const { navItems, roleLabel } = profile
    ? getSidebarConfigForRole(profile.role)
    : fallbackSidebar;
  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
    : 'Usuario';

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />

      <main className="dashboard-main">
        <div className="purchases-page-content">
          {/* Breadcrumb */}
          <div className="purchases-breadcrumb">
            <button className="purchases-back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Volver al catálogo
            </button>
            <span className="purchases-breadcrumb-sep">/</span>
            <span className="purchases-breadcrumb-current">Biblioteca</span>
          </div>

          <h1 className="purchases-page-title">Biblioteca</h1>

          {error && (
            <div className="purchases-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="purchases-loading-state">
              <p className="purchases-state-message">Cargando tus compras...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="purchases-empty-state">
              <div className="purchases-empty-icon-wrap">
                <Package className="purchases-empty-icon" size={48} />
              </div>
              <h2 className="purchases-empty-title">Aún no tienes compras</h2>
              <p className="purchases-empty-text">
                Cuando adquieras alguna coreografía o curso, aparecerá aquí para que puedas acceder a su contenido en cualquier momento.
              </p>
              <button
                className="purchases-explore-btn"
                onClick={() => navigate('/')}
              >
                Explorar catálogo de cursos
              </button>
            </div>
          ) : (
            <div className="purchases-grid">
              {purchases.map((item) => (
                <div
                  key={item.id}
                  className="purchases-card"
                  onClick={() => navigate(`/curso/${item.choreography}`)}
                >
                  <div className="purchases-card__image-wrap">
                    <img
                      src={item.image}
                      alt={item.choreography_name}
                      className="purchases-card__image"
                    />
                    <span className="purchases-card__genre">{item.genre}</span>
                    <div className="purchases-card__overlay">
                      <Play size={20} />
                      <span>Ver curso</span>
                    </div>
                  </div>

                  <div className="purchases-card__body">
                    <h3 className="purchases-card__title">
                      {item.choreography_name}
                    </h3>

                    <p className="purchases-card__instructor">
                      Por {item.creator_name || 'Profesor'}
                    </p>

                    <div className="purchases-card__meta">
                      {item.difficulty_level && (
                        <span className="purchases-card__level">
                          {LEVEL_LABELS[item.difficulty_level] || item.difficulty_level}
                        </span>
                      )}
                      {item.price && (
                        <span className="purchases-card__price">
                          ${item.priceFormatted} COP
                        </span>
                      )}
                    </div>

                    {item.date && (
                      <p className="purchases-card__date">
                        Adquirido el {formatDate(item.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyPurchasesPage;

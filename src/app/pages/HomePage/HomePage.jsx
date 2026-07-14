import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CourseCard from '../../components/CourseCard/CourseCard';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import Loader from '../../components/Loader/Loader';
import { useProfile } from '../../context/ProfileContext';
import { COURSES } from '../../data/courses';

// Imágenes
import salsaImg from '../../../assets/catalog/salsa-h.webp';
import bachataImg from '../../../assets/catalog/bachata-h.webp';
import reggaetonImg from '../../../assets/catalog/reggaeton-h.webp';

import './HomePage.css';

const PAGE_SIZE = 6;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function HomePage() {
  const catalogRef = useRef(null);
  const navigate = useNavigate();

  const [choreographies, setChoreographies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [isAuthenticated] = useState(!!localStorage.getItem("access_token"));
  const [collapsed, setCollapsed] = useState(false);
  const { profile, profileLoading, profileError } = useProfile();
  const [purchasedIds, setPurchasedIds] = useState(new Set());

  const GENRES = ['Salsa', 'Bachata', 'Merengue', 'Reggaetón', 'Hip-Hop', 'Pop', 'Dancehall', 'Zumba'];
  const DIFFICULTIES = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('access_token');

    fetch(`${API_BASE_URL}/api/academy/my-courses/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPurchasedIds(new Set((data || []).map((e) => e.choreography))))
      .catch(() => {});
  }, [isAuthenticated]);

  const fetchChoreographies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: search,
        genre: genre,
        difficulty: difficulty,
      });

      const response = await fetch(`${API_BASE_URL}/api/academy/choreographies/?${params.toString()}`);
      const data = await response.json();

      const mappedData = (data.results || []).map(ch => ({
        id: ch.choreography_id,
        title: ch.song_name,
        instructor: ch.creator_name || "Profesor Ritnova",
        image: ch.thumbnail_url || "/logoIcono.png",
        genre: ch.genre,
        price: ch.price ? Number(ch.price).toLocaleString('es-CO') : "0",
        rating: ch.rating || 0,
        students: ch.students_count || 0,
        level: ch.difficulty_level
      }));

      if (maxPrice) {
        const filtered = mappedData.filter(ch => Number(ch.price.replace(/\./g, '')) <= Number(maxPrice));
        setChoreographies(filtered);
      } else {
        setChoreographies(mappedData);
      }
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Error cargando catálogo:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, genre, difficulty, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChoreographies();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchChoreographies]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  // --- LÓGICA DEL CATÁLOGO ---
    const renderCatalog = () => (
      <section className={`catalog ${isAuthenticated ? 'catalog--app' : ''}`} ref={catalogRef}>
        {!isAuthenticated && (
          <div className="catalog__header">
            <div>
              <p className="catalog__label">NUESTRAS COREOGRAFÍAS</p>
              <h2 className="catalog__title">¡Descubre lo que puedes aprender!</h2>
            </div>
          </div>
        )}

        <div className="catalog__filters-container">
          <div className="catalog__filters">
            <div className="catalog__search-wrap">
              <svg className="catalog__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="catalog__search"
                type="text"
                placeholder="Buscar coreografía o instructor..."
                value={search}
                onChange={handleFilterChange(setSearch)}
              />
            </div>

            <select className="catalog__select" value={genre} onChange={handleFilterChange(setGenre)}>
              <option value="">Todos los géneros</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select className="catalog__select" value={difficulty} onChange={handleFilterChange(setDifficulty)}>
              <option value="">Dificultad</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select className="catalog__select" value={maxPrice} onChange={handleFilterChange(setMaxPrice)}>
              <option value="">Precio máximo</option>
              <option value="80000">Hasta $80.000</option>
              <option value="100000">Hasta $100.000</option>
              <option value="120000">Hasta $120.000</option>
              <option value="200000">Hasta $200.000</option>
            </select>

            {(search || genre || difficulty || maxPrice) && (
              <button className="catalog__clear" onClick={() => { setSearch(''); setGenre(''); setDifficulty(''); setMaxPrice(''); setCurrentPage(1); }}>
                Limpiar ✕
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loader label="Cargando coreografías..." />
        ) : choreographies.length === 0 ? (
          <div className="catalog__empty">
            <span className="catalog__empty-icon">🕺</span>
            <p className="catalog__empty-title">No hay coreografías disponibles con estos filtros</p>
          </div>
        ) : (
          <div className="catalog__grid">
            {choreographies.map(course => (
              <CourseCard key={course.id} course={course} purchased={purchasedIds.has(course.id)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination__btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination__btn pagination__btn--num ${currentPage === page ? 'pagination__btn--active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button className="pagination__btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Siguiente →
            </button>
          </div>
        )}
      </section>
    );

    if (!isAuthenticated) {
      return (
        <div className="home-page">
          <Navbar onCatalogClick={scrollToCatalog} />
          <section className="hero">
            <div className="hero__content">
              <div className="hero__badge"><span>✦</span> Academia online · +12.000 estudiantes</div>
              <h1 className="hero__title">
                Aprende a bailar con <span className="hero__title--orange">coreografías</span> <span className="hero__title--pink">reales</span> paso a paso.
              </h1>
              <p className="hero__subtitle">Salsa, bachata, hip-hop y más. Videos guiados por profesores certificados.</p>
              <div className="hero__actions">
                <button className="hero__btn hero__btn--primary" onClick={scrollToCatalog}>Explorar catálogo →</button>
                <button className="hero__btn hero__btn--ghost" onClick={() => navigate('/login')}>▷ Iniciar sesión</button>
              </div>
            </div>
            <div className="hero__images">
              <div className="hero__img-grid">
                <img src={salsaImg} alt="Salsa" className="hero__img hero__img--1" />
                <img src={bachataImg} alt="Bachata" className="hero__img hero__img--2" />
                <img src={reggaetonImg} alt="Reggaetón" className="hero__img hero__img--3" />
              </div>
            </div>
          </section>
          {renderCatalog()}
          <Footer />
        </div>
      );
    }

    if (profileLoading && !profile && !profileError) {
      return <Loader fullscreen label="Cargando..." />;
    }

    const { navItems, roleLabel } = getSidebarConfigForRole(profile?.role || 'student');
    const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email : 'Usuario';

    return (
      <div className="dashboard-layout">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          userName={fullName}
          userRole={roleLabel}
          navItems={navItems}
        />
        <main className="dashboard-main">
          {renderCatalog()}
        </main>
      </div>
    );
  }

  export default HomePage;
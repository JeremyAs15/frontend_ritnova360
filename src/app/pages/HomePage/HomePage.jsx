import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CourseCard from '../../components/CourseCard/CourseCard';
import { COURSES } from '../../data/courses';
import salsaImg from '../../../assets/catalog/salsa-h.webp';
import bachataImg from '../../../assets/catalog/bachata-h.webp';
import reggaetonImg from '../../../assets/catalog/reggaeton-h.webp';
import './HomePage.css';

const PAGE_SIZE = 6;

function HomePage() {
  const catalogRef = useRef(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const isAuthenticated = !!localStorage.getItem("access_token");

  const GENRES = [...new Set(COURSES.map(c => c.genre))];
  const DIFFICULTIES = ['Principiante', 'Intermedio', 'Todos los niveles'];

  const filtered = COURSES.filter(course => {
    const matchSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre ? course.genre === genre : true;
    const matchDifficulty = difficulty ? course.level === difficulty : true;
    const matchPrice = maxPrice
      ? Number(course.price.replace('.', '')) <= Number(maxPrice)
      : true;
    return matchSearch && matchGenre && matchDifficulty && matchPrice;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="home-page">
      <Navbar onCatalogClick={scrollToCatalog} />

      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">
            <span>✦</span> Academia online · +12.000 estudiantes
          </div>
          <h1 className="hero__title">
            Aprende a bailar con{' '}
            <span className="hero__title--orange">coreografías</span>{' '}
            <span className="hero__title--pink">reales</span>{' '}
            paso a paso.
          </h1>
          <p className="hero__subtitle">
            Salsa, bachata, hip-hop y más. Videos guiados por profesores
            certificados, entretenimiento y comunidad.
          </p>
          <div className="hero__actions">
            <button
              className="hero__btn hero__btn--primary"
              onClick={scrollToCatalog}
            >
              Explorar catálogo →
            </button>
            {!isAuthenticated && (
              <button
                className="hero__btn hero__btn--ghost"
                onClick={() => navigate('/login')}
              >
                ▷ Iniciar sesión
              </button>
            )}
          </div>
        </div>

        <div className="hero__images">
          <div className="hero__img-grid">
            <img
              src={salsaImg}
              alt="Baile en grupo"
              className="hero__img hero__img--1"
            />
            <img
              src={bachataImg}
              alt="Bailarina"
              className="hero__img hero__img--2"
            />
            <img
              src={reggaetonImg}
              alt="Clase de baile"
              className="hero__img hero__img--3"
            />
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="catalog" ref={catalogRef}>
        <div className="catalog__header">
          <div>
            <p className="catalog__label">NUESTRAS COREOGRAFÍAS</p>
            <h2 className="catalog__title">Descubre lo que puedes aprender!</h2>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="catalog__filters">
          <div className="catalog__search-wrap">
            <svg
              className="catalog__search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="catalog__search"
              type="text"
              placeholder="Buscar coreografía o instructor..."
              value={search}
              onChange={handleFilterChange(setSearch)}
            />
          </div>

          <select
            className="catalog__select"
            value={genre}
            onChange={handleFilterChange(setGenre)}
          >
            <option value="">Todos los géneros</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            className="catalog__select"
            value={difficulty}
            onChange={handleFilterChange(setDifficulty)}
          >
            <option value="">Dificultad</option>
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="catalog__select"
            value={maxPrice}
            onChange={handleFilterChange(setMaxPrice)}
          >
            <option value="">Precio máximo</option>
            <option value="80000">Hasta $80.000</option>
            <option value="100000">Hasta $100.000</option>
            <option value="120000">Hasta $120.000</option>
          </select>

          {(search || genre || difficulty || maxPrice) && (
            <button
              className="catalog__clear"
              onClick={() => {
                setSearch('');
                setGenre('');
                setDifficulty('');
                setMaxPrice('');
                setCurrentPage(1);
              }}
            >
              Limpiar ✕
            </button>
          )}
        </div>

        {paginated.length === 0 ? (
          <div className="catalog__empty">
            <span className="catalog__empty-icon">🕺</span>
            <p className="catalog__empty-title">No hay coreografías disponibles</p>
            <p className="catalog__empty-subtitle">
              Intenta con otros filtros o términos de búsqueda.
            </p>
          </div>
        ) : (
          <div className="catalog__grid">
            {paginated.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination__btn pagination__btn--num ${
                  currentPage === page ? 'pagination__btn--active' : ''
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CourseCard from '../../components/CourseCard/CourseCard';
import { COURSES } from '../../data/courses';
import './HomePage.css';

const PAGE_SIZE = 6;

function HomePage() {
  const catalogRef = useRef(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(COURSES.length / PAGE_SIZE);
  const paginated = COURSES.slice(
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

  return (
    <div className="home-page">
      <Navbar onCatalogClick={scrollToCatalog} />

      {/* Hero */}
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
            Salsa, bachata, hip-hop y más. Videos guiados por profesores certificados, entretenimiento y comunidad.
          </p>
          <div className="hero__actions">
            <button className="hero__btn hero__btn--primary" onClick={scrollToCatalog}>
              Explorar catálogo →
            </button>
            <button className="hero__btn hero__btn--ghost" onClick={() => navigate('/login')}>
              ▷ Iniciar sesión
            </button>
          </div>
        </div>

        <div className="hero__images">
          <div className="hero__img-grid">
            <img src="https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=500&auto=format&fit=crop" alt="Baile en grupo" className="hero__img hero__img--1" />
            <img src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=500&auto=format&fit=crop" alt="Bailarina" className="hero__img hero__img--2" />
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop" alt="Clase de baile" className="hero__img hero__img--3" />
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
          <button className="catalog__ver-todas" onClick={() => navigate('/')}>
            Ver todas →
          </button>
        </div>
        
        {paginated.length === 0 ? (
          <div className="catalog__empty">
            <span className="catalog__empty-icon">🕺</span>
            <p className="catalog__empty-title">No hay coreografías disponibles</p>
            <p className="catalog__empty-subtitle">Pronto habrá nuevos cursos. ¡Vuelve más tarde!</p>
        </div>
      ) : (
        <div className="catalog__grid">
          {paginated.map((course) => (
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination__btn pagination__btn--num ${currentPage === page ? 'pagination__btn--active' : ''}`}
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
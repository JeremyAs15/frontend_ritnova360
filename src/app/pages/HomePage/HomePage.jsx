import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './HomePage.css';

/* Datos de ejemplo para el catálogo */
const COURSES = [
  { id: 1, title: 'Salsa para Principiantes', instructor: 'Sebastián Rojas', genre: 'Salsa', price: '100.000', rating: 4.8, image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&auto=format&fit=crop' },
  { id: 2, title: 'Bachata Sensual', instructor: 'Valentina Pineda', genre: 'Bachata', price: '120.000', rating: 4.9, image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&auto=format&fit=crop' },
  { id: 3, title: 'Hip-Hop Freestyle', instructor: 'Camilo Giraldo', genre: 'Hip-Hop', price: '100.000', rating: 4.7, image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&auto=format&fit=crop' },
  { id: 4, title: 'Reggaetón Paso a Paso', instructor: 'Esteban Suárez', genre: 'Reggaetón', price: '120.000', rating: 4.6, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop' },
  { id: 5, title: 'Zumba en Casa', instructor: 'Tatiana Duque', genre: 'Zumba', price: '80.000', rating: 4.8, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop' },
  { id: 6, title: 'Dancehall Femenino', instructor: 'Valeria Mora', genre: 'Dancehall', price: '110.000', rating: 4.7, image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop' },
];

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f97316" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function CourseCard({ course }) {
  const navigate = useNavigate();
  return (
    <div className="course-card" onClick={() => navigate('/login')}>
      <div className="course-card__image-wrap">
        <img src={course.image} alt={course.title} className="course-card__image" />
        <span className="course-card__genre">{course.genre}</span>
      </div>
      <div className="course-card__body">
        <h3 className="course-card__title">{course.title}</h3>
        <p className="course-card__instructor">{course.instructor}</p>
        <div className="course-card__footer">
          <span className="course-card__rating">
            <StarIcon /> {course.rating}
          </span>
          <span className="course-card__price">${course.price} COP</span>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const catalogRef = useRef(null);
  const navigate = useNavigate();

  const scrollToCatalog = () => {
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

        <div className="catalog__grid">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="public/LogoLargo.png" alt="Ritnova 360" className="footer__logo" />
            <p className="footer__tagline">
              La academia de danza online más vibrante de Colombia. Aprende, baila y transforma tu vida.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social">Instagram</a>
              <a href="#" className="footer__social">TikTok</a>
              <a href="#" className="footer__social">YouTube</a>
            </div>
          </div>

          <div className="footer__col">
            <h4>Academia</h4>
            <a href="#">Sobre Nosotros</a>
            <a href="#">Nuestros Profesores</a>
            <a href="#">Blog</a>
            <a href="#">Comunidad</a>
          </div>

          <div className="footer__col">
            <h4>Cursos</h4>
            <a href="#">Salsa</a>
            <a href="#">Bachata</a>
            <a href="#">Hip-Hop</a>
            <a href="#">Reggaetón</a>
            <a href="#">Zumba</a>
          </div>

          <div className="footer__col">
            <h4>Soporte</h4>
            <a href="#">Centro de ayuda</a>
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Ritnova360. Todos los derechos reservados.</p>
          <p>Cali, Colombia · soporte@ritnova360.com · +57 300 123 4567</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
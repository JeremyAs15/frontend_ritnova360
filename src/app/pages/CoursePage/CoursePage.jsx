import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CourseCard from '../../components/CourseCard/CourseCard';
import './CoursePage.css';
import { COURSES } from '../../data/courses';
import StarIcon from '../../components/StarIcon';

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LevelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/* ─── Componente principal ───────────────────────────────────────── */
function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = COURSES.find((c) => c.id === Number(id));

  if (!course) {
    return (
      <div className="course-page">
        <Navbar />
        <div className="course-page__not-found">
          <p>Coreografía no encontrada.</p>
          <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
        <Footer />
      </div>
    );
  }

  const related = COURSES.filter((c) => c.id !== course.id).slice(0, 3);

  return (
    <div className="course-page">
      <Navbar />

      <main className="course-page__main">

        {/* ── Breadcrumb ── */}
        <div className="course-page__breadcrumb">
          <button className="course-page__back" onClick={() => navigate('/')}>
            <ArrowLeftIcon /> Volver al catálogo
          </button>
          <span className="course-page__genre-tag">{course.genre}</span>
        </div>

        {/* ── Hero del curso ── */}
        <section className="course-hero">
          <div className="course-hero__info">
            <h1 className="course-hero__title">{course.title}</h1>
            <p className="course-hero__description">{course.description}</p>

            <div className="course-hero__meta">
              <span className="course-hero__meta-item">
                <StarIcon /> {course.rating} <span className="course-hero__reviews">({course.reviews} reseñas)</span>
              </span>
              <span className="course-hero__meta-item"><LevelIcon /> {course.level}</span>
              <span className="course-hero__meta-item"><ClockIcon /> {course.duration}</span>
              <span className="course-hero__meta-item"><UsersIcon /> {course.students.toLocaleString('es-CO')} estudiantes</span>
            </div>

            {/* Instructor */}
            <div className="course-hero__instructor">
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="course-hero__instructor-avatar"
              />
              <div>
                <p className="course-hero__instructor-name">{course.instructor}</p>
                <p className="course-hero__instructor-bio">{course.instructorBio}</p>
              </div>
            </div>
          </div>

          {/* Card de compra */}
          <aside className="course-hero__card">
            <div className="course-hero__card-image-wrap">
              <img src={course.image} alt={course.title} className="course-hero__card-image" />
              <button className="course-hero__card-play" aria-label="Vista previa">
                <span className="course-hero__card-play-icon"><PlayIcon /></span>
                <span>Vista previa</span>
              </button>
            </div>
            <div className="course-hero__card-body">
              <p className="course-hero__card-price">
                <span className="course-hero__card-price-amount">${course.price}</span>
                <span className="course-hero__card-price-currency"> COP</span>
              </p>
              <button
                className="course-hero__card-btn course-hero__card-btn--primary"
                onClick={() => navigate('/signup')}
              >
                Inscribirme ahora
              </button>
              <button
                className="course-hero__card-btn course-hero__card-btn--ghost"
                onClick={() => navigate(`/curso/${course.id}`)}
              >
                Ya tengo cuenta
              </button>
              <p className="course-hero__card-guarantee">
                ✓ Acceso de por vida &nbsp;·&nbsp; ✓ Sin fecha límite
              </p>
            </div>
          </aside>
        </section>

        {/* ── Temario ── */}
        <section className="course-modules">
          <h2 className="course-modules__title">Contenido del curso</h2>
          <p className="course-modules__summary">
            {course.modules.length} módulos · {course.modules.reduce((a, m) => a + m.lessons, 0)} lecciones
          </p>
          <ol className="course-modules__list">
            {course.modules.map((mod) => (
              <li key={mod.num} className="course-modules__item">
                <span className="course-modules__num">{mod.num}</span>
                <span className="course-modules__name">{mod.title}</span>
                <span className="course-modules__lessons">{mod.lessons} lecciones</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Cursos relacionados ── */}
        <section className="course-related">
          <h2 className="course-related__title">También te puede interesar</h2>
          <div className="course-related__grid">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default CoursePage;
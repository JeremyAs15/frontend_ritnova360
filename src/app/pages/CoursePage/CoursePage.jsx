import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CourseCard from '../../components/CourseCard/CourseCard';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import { COURSES } from '../../data/courses';
import StarIcon from '../../components/StarIcon';
import './CoursePage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ClockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function LevelIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>; }
function PlayIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>; }
function ArrowLeftIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }

function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = COURSES.find((c) => c.id === Number(id));

  // --- Lógica de Autenticación ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access_token"));
  const [profile, setProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE_URL}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then(setProfile)
        .catch(() => setIsAuthenticated(false));
    }
  }, [isAuthenticated]);

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

  const renderMainContent = () => (
    <main className={`course-page__main ${isAuthenticated ? 'course-page__main--app' : ''}`}>
      <div className="course-page__breadcrumb">
        <button className="course-page__back" onClick={() => navigate('/')}>
          <ArrowLeftIcon /> Volver al catálogo
        </button>
        <span className="course-page__genre-tag">{course.genre}</span>
      </div>

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

          <div className="course-hero__instructor">
            <img src={course.instructorAvatar} alt={course.instructor} className="course-hero__instructor-avatar" />
            <div>
              <p className="course-hero__instructor-name">{course.instructor}</p>
              <p className="course-hero__instructor-bio">{course.instructorBio}</p>
            </div>
          </div>
        </div>

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

            {!isAuthenticated ? (
              <>
                <button className="course-hero__card-btn course-hero__card-btn--primary" onClick={() => navigate('/signup')}>
                  Inscribirme ahora
                </button>
                <button className="course-hero__card-btn course-hero__card-btn--ghost" onClick={() => navigate('/login')}>
                  Ya tengo cuenta
                </button>
              </>
            ) : (
              <button className="course-hero__card-btn course-hero__card-btn--primary" onClick={() => console.log("Añadir al carrito")}>
                Añadir al carrito
              </button>
            )}
            
            <p className="course-hero__card-guarantee">
              ✓ Acceso de por vida &nbsp;·&nbsp; ✓ Sin fecha límite
            </p>
          </div>
        </aside>
      </section>

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

      <section className="course-related">
        <h2 className="course-related__title">También te puede interesar</h2>
        <div className="course-related__grid">
          {related.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>
    </main>
  );

  // VISTA PÚBLICA
  if (!isAuthenticated) {
    return (
      <div className="course-page">
        <Navbar />
        {renderMainContent()}
        <Footer />
      </div>
    );
  }

  // VISTA APP
  const { navItems, roleLabel } = getSidebarConfigForRole(profile?.role || 'student');
  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Usuario';

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />
      <main className="dashboard-main" style={{ padding: '0 20px' }}>
        {renderMainContent()}
      </main>
    </div>
  );
}

export default CoursePage;
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { COURSES } from '../../data/courses';
import { ArrowLeft, Play, Clock, Users, Star } from 'lucide-react';
import './CoursePage.css';

function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = COURSES.find((c) => c.id === Number(id));
    setCourse(found);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="course-page__loading">
        <div className="spinner" />
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-page__not-found">
        <ArrowLeft className="course-page__back-icon" />
        <Link to="/" className="course-page__back-link">
          Volver al catálogo
        </Link>
        <h1>Curso no encontrado</h1>
        <p>El curso que buscas no existe o ha sido eliminado.</p>
        <Link to="/" className="course-page__btn">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="course-page">
      <div className="course-page__container">
        <Link to="/" className="course-page__back">
          <ArrowLeft className="course-page__back-icon" />
          Volver al catálogo
        </Link>

        <div className="course-page__header">
          <div className="course-page__video-wrapper">
            <video
              className="course-page__video"
              controls
              poster={course.thumbnail}
              src={course.videoUrl}
            />
            <div className="course-page__play-overlay">
              <Play className="course-page__play-icon" />
            </div>
          </div>

          <div className="course-page__info">
            <h1 className="course-page__title">{course.title}</h1>
            <p className="course-page__instructor">
              Por {course.instructor}
            </p>

            <div className="course-page__meta">
              <span className="course-page__meta-item">
                <Clock className="course-page__meta-icon" />
                {course.duration}
              </span>
              <span className="course-page__meta-item">
                <Users className="course-page__meta-icon" />
                {course.students} estudiantes
              </span>
              <span className="course-page__meta-item">
                <Star className="course-page__meta-icon" />
                {course.rating} ({course.reviews} reseñas)
              </span>
            </div>

            <p className="course-page__description">{course.description}</p>

            <div className="course-page__price-section">
              <span className="course-page__price">${course.price}</span>
              <Link to="/carrito" className="course-page__btn course-page__btn--primary">
                Agregar al carrito
              </Link>
              <Link to="/checkout" className="course-page__btn course-page__btn--secondary">
                Comprar ahora
              </Link>
            </div>
          </div>
        </div>

        <div className="course-page__content">
          <div className="course-page__curriculum">
            <h2 className="course-page__section-title">Contenido del curso</h2>
            <ul className="course-page__lessons">
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id} className="course-page__lesson">
                  <span className="course-page__lesson-number">{index + 1}</span>
                  <div className="course-page__lesson-info">
                    <h3 className="course-page__lesson-title">{lesson.title}</h3>
                    <span className="course-page__lesson-duration">
                      <Clock className="course-page__lesson-icon" />
                      {lesson.duration}
                    </span>
                  </div>
                  <Play className="course-page__lesson-play" />
                </li>
              ))}
            </ul>
          </div>

          <div className="course-page__instructor">
            <h2 className="course-page__section-title">Instructor</h2>
            <div className="course-page__instructor-card">
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="course-page__instructor-avatar"
              />
              <div className="course-page__instructor-info">
                <h3 className="course-page__instructor-name">{course.instructor}</h3>
                <p className="course-page__instructor-bio">{course.instructorBio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
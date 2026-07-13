import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { COURSES } from '../../data/courses';
import { ArrowLeft, Play, Clock, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CoursePage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function mapAPIToCourse(ch) {
  const clips = ch.video_clips || [];
  return {
    id: ch.choreography_id,
    title: ch.song_name,
    instructor: ch.creator_name || 'Profesor Ritnova',
    instructorBio: `${ch.creator_name || 'Profesor Ritnova'} — instructor principal de esta coreografía.`,
    instructorAvatar: ch.creator_avatar || 'https://i.pravatar.cc/80?img=1',
    genre: ch.genre || '',
    price: ch.price ? Number(ch.price).toLocaleString('es-CO') : '0',
    rating: 4.8,
    reviews: 0,
    level: ch.difficulty_level || '',
    duration: `${clips.length} video${clips.length !== 1 ? 's' : ''}`,
    students: 0,
    thumbnail: ch.thumbnail_url || '/logoIcono.png',
    videoUrl: clips[0]?.video_url || '',
    image: ch.thumbnail_url || '/logoIcono.png',
    description: ch.description || '',
    lessons: clips.map((clip, i) => ({
      id: i + 1,
      title: clip.title || `Parte ${clip.part_number || i + 1}`,
      duration: clip.duration || '',
    })),
  };
}

function mapLocalToCourse(c) {
  return {
    ...c,
    thumbnail: c.image,
    videoUrl: c.videoUrl || '',
    lessons: c.lessons || (c.modules || []).map((m, i) => ({
      id: i + 1,
      title: m.title,
      duration: `${m.lessons} clases`,
    })),
  };
}

function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartAdding, isInCart, refreshCart } = useCart();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/academy/choreographies/${id}/`,
          { signal: controller.signal }
        );
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCourse(mapAPIToCourse(data));
          else return;
        } else {
          throw new Error('not found in API');
        }
      } catch {
        if (cancelled) return;
        const found = COURSES.find((c) => c.id === Number(id));
        setCourse(found ? mapLocalToCourse(found) : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; controller.abort(); };
  }, [id]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

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
      <div className="course-page__main">
        <div className="course-page__breadcrumb">
          <Link to="/" className="course-page__back">
            <ArrowLeft size={16} />
            Volver al catálogo
          </Link>
          <span className="course-page__genre-tag">{course.genre}</span>
        </div>

        <div className="course-hero">
          <div>
            <h1 className="course-hero__title">{course.title}</h1>
            <p className="course-hero__description">{course.description}</p>

            <div className="course-hero__meta">
              <span className="course-hero__meta-item">
                <Clock size={16} />
                {course.duration}
              </span>
              <span className="course-hero__meta-item">
                <Users size={16} />
                {course.students} estudiantes
              </span>
              <span className="course-hero__meta-item">
                <Star size={16} />
                {course.rating} <span className="course-hero__reviews">({course.reviews} reseñas)</span>
              </span>
            </div>

            <div className="course-hero__instructor">
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="course-hero__instructor-avatar"
              />
              <div>
                <h3 className="course-hero__instructor-name">{course.instructor}</h3>
                <p className="course-hero__instructor-bio">{course.instructorBio}</p>
              </div>
            </div>
          </div>

          <div className="course-hero__card">
            <div className="course-hero__card-image-wrap">
              {showVideo && course.videoUrl ? (
                <video
                  className="course-hero__card-image"
                  controls
                  autoPlay
                  src={course.videoUrl}
                />
              ) : (
                <>
                  <img
                    className="course-hero__card-image"
                    src={course.thumbnail}
                    alt={course.title}
                  />
                  {course.videoUrl && (
                    <button
                      className="course-hero__card-play"
                      onClick={() => setShowVideo(true)}
                    >
                      <div className="course-hero__card-play-icon">
                        <Play size={20} />
                      </div>
                      Ver promocional
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="course-hero__card-body">
              <p className="course-hero__card-price">
                <span className="course-hero__card-price-currency">$</span>
                <span className="course-hero__card-price-amount">{course.price}</span>
              </p>
              <button
                className="course-hero__card-btn course-hero__card-btn--primary"
                disabled={cartAdding || isInCart(course.id)}
                onClick={async () => {
                  await addToCart(course.id);
                  showToast('Coreografía agregada al carrito');
                }}
              >
                {cartAdding ? 'Agregando...' : isInCart(course.id) ? 'Ya está en el carrito' : 'Agregar al carrito'}
              </button>
              <p className="course-hero__card-guarantee">
                Cancelación gratuita hasta 7 días
              </p>
            </div>
          </div>
        </div>

        <div className="course-modules">
          <h2 className="course-modules__title">Contenido del curso</h2>
          <p className="course-modules__summary">
            {course.lessons.length} módulo{course.lessons.length !== 1 ? 's' : ''}
          </p>
          <ul className="course-modules__list">
            {course.lessons.map((lesson, index) => (
              <li key={lesson.id} className="course-modules__item">
                <span className="course-modules__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="course-modules__name">{lesson.title}</span>
                <span className="course-modules__lessons">{lesson.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {toast && (
        <div className={`course-page__toast course-page__toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default CoursePage;
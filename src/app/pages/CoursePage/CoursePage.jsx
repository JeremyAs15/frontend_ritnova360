import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { COURSES } from '../../data/courses';
import { ArrowLeft, Play, Clock, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getUserRoleFromToken } from '../../utils/auth';
import Loader from '../../components/Loader/Loader';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import './CoursePage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STAFF_ROLES = ['admin', 'director', 'teacher'];

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
    rating: ch.rating || 0,
    reviews: ch.reviews_count || 0,
    students: ch.students_count || 0,
    level: ch.difficulty_level || '',
    duration: `${clips.length} video${clips.length !== 1 ? 's' : ''}`,
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
  const { addToCart, cartAdding, isInCart, removeFromCart, refreshCart } = useCart();
  const role = getUserRoleFromToken(localStorage.getItem('access_token')) ?? localStorage.getItem('role');
  const canPurchase = !STAFF_ROLES.includes(role);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [toast, setToast] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const [isAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [profile, setProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const showToast = (message, type = 'success', action = null) => {
    setToast({ message, type, action });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirmRemoveFromCart = async () => {
    setRemovingFromCart(true);
    try {
      await removeFromCart(course.id);
      setShowRemoveConfirm(false);
      showToast('Coreografía eliminada del carrito');
    } finally {
      setRemovingFromCart(false);
    }
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

    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/academy/my-courses/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPurchasedIds(new Set((data || []).map((e) => e.choreography))))
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/users/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setProfile(data))
      .catch(() => {});
  }, [refreshCart]);

  if (loading) {
    return <Loader label="Cargando curso..." fullscreen />;
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

  const pageContent = (
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
              {canPurchase && (
                <>
                  {purchasedIds.has(course.id) ? (
                    <button
                      className="course-hero__card-btn course-hero__card-btn--ghost"
                      onClick={() => navigate('/mis-compras')}
                    >
                      <CheckCircle size={16} /> Ir a mi biblioteca
                    </button>
                  ) : isInCart(course.id) ? (
                    <button
                      className="course-hero__card-btn course-hero__card-btn--danger-ghost"
                      onClick={() => setShowRemoveConfirm(true)}
                    >
                      Quitar del carrito
                    </button>
                  ) : (
                    <button
                      className="course-hero__card-btn course-hero__card-btn--primary"
                      disabled={cartAdding}
                      onClick={async () => {
                        await addToCart(course.id);
                        showToast('Coreografía agregada al carrito', 'success', {
                          label: 'Ver carrito',
                          onClick: () => navigate('/carrito'),
                        });
                      }}
                    >
                      {cartAdding ? 'Agregando...' : 'Agregar al carrito'}
                    </button>
                  )}
                  <p className="course-hero__card-guarantee">
                    Cancelación gratuita hasta 7 días
                  </p>
                </>
              )}
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

      <ConfirmModal
        open={showRemoveConfirm}
        title="¿Quitar del carrito?"
        message={<>¿Estás seguro de que deseas quitar <strong>{course.title}</strong> de tu carrito?</>}
        confirmLabel="Quitar"
        onConfirm={handleConfirmRemoveFromCart}
        onCancel={() => setShowRemoveConfirm(false)}
        loading={removingFromCart}
      />

      {toast && (
        <div className={`course-page__toast course-page__toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
          {toast.action && (
            <button className="course-page__toast-action" onClick={toast.action.onClick}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return pageContent;
  }

  const { navItems, roleLabel } = getSidebarConfigForRole(profile?.role);
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
        {pageContent}
      </main>
    </div>
  );
}

export default CoursePage;
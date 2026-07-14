import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Award, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './ClassroomPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ClassroomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [course, setCourse] = useState(null);
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchedClips, setWatchedClips] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadClassroomData = async () => {
      setLoading(true);
      try {
        // 1. Cargar Perfil
        const profRes = await fetchWithAuth(`${API_BASE_URL}/api/users/profile/`);
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
        }

        // 2. Cargar detalle de la Coreografía (incluye clips de video)
        const courseRes = await fetchWithAuth(`${API_BASE_URL}/api/academy/choreographies/${id}/`);
        if (!courseRes.ok) {
          throw new Error('No se pudo verificar el acceso a esta clase.');
        }
        const courseData = await courseRes.json();
        setCourse(courseData);
        
        const sortedClips = (courseData.video_clips || []).sort((a, b) => a.part_number - b.part_number);
        setClips(sortedClips);
        
        if (sortedClips.length > 0) {
          setSelectedClip(sortedClips[0]);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar los recursos de la clase.');
      } finally {
        setLoading(false);
      }
    };

    loadClassroomData();
  }, [id, navigate, fetchWithAuth]);

  // Registra la vista en el backend al reproducir o interactuar con el clip
  const handleMarkAsViewed = async (clipId) => {
    if (watchedClips.has(clipId)) return;

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/videos/${clipId}/view/`, {
        method: 'POST'
      });
      if (res.ok) {
        setWatchedClips(prev => new Set([...prev, clipId]));
        setToastMessage('¡Sección completada!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error al guardar el progreso en el servidor:', err);
    }
  };

  if (loading) {
    return (
      <div className="classroom-loading">
        <div className="spinner" />
        <p>Abriendo tu aula virtual...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="classroom-error">
        <div className="classroom-error-card">
          <ArrowLeft size={24} className="error-back-icon" onClick={() => navigate('/mis-compras')} />
          <h2>Acceso restringido o error de carga</h2>
          <p>{error || 'No se pudo verificar tu suscripción a este material educativo.'}</p>
          <button onClick={() => navigate('/mis-compras')} className="classroom-btn-primary">
            Volver a mi biblioteca
          </button>
        </div>
      </div>
    );
  }

  const fallbackSidebar = getSidebarConfigForRole('student');
  const { navItems, roleLabel } = profile ? getSidebarConfigForRole(profile.role) : fallbackSidebar;
  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Estudiante';

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />

      <main className="dashboard-main classroom-workspace">
        {/* Encabezado del aula */}
        <div className="classroom-header">
          <button className="classroom-back-button" onClick={() => navigate('/mis-compras')}>
            <ArrowLeft size={16} /> Volver a la biblioteca
          </button>
          <div className="classroom-meta">
            <span className="classroom-genre-tag">{course.genre}</span>
            <span className="classroom-difficulty-tag">{course.difficulty_level}</span>
          </div>
          <h1 className="classroom-course-title">{course.song_name}</h1>
          <p className="classroom-instructor-name">Por {course.creator_name || 'Instructor de Ritnova'}</p>
        </div>

        {/* Distribución del reproductor y playlist */}
        <div className="classroom-grid">
          {/* Panel Principal de Video */}
          <div className="classroom-player-area">
            {selectedClip ? (
              <div className="classroom-player-wrapper">
                {selectedClip.media_type === 'image' ? (
                  <div className="classroom-image-viewer">
                    <img src={selectedClip.video_url} alt={`Guía paso ${selectedClip.part_number}`} />
                    <div className="image-viewer-caption">
                      Guía visual de referencia - Sección {selectedClip.part_number}
                    </div>
                  </div>
                ) : (
                  <VideoPlayer
                    videoUrl={selectedClip.video_url}
                    onProgressMark={() => handleMarkAsViewed(selectedClip.clip_id)}
                  />
                )}
                
                <div className="classroom-clip-description">
                  <h3>Sección {selectedClip.part_number} en reproducción</h3>
                  <p>Inicia el video para marcar esta sección de la coreografía como estudiada y sumar horas de práctica.</p>
                  
                  {!watchedClips.has(selectedClip.clip_id) ? (
                    <button 
                      onClick={() => handleMarkAsViewed(selectedClip.clip_id)} 
                      className="classroom-manual-complete-btn"
                    >
                      <CheckCircle size={16} /> Marcar esta sección como vista
                    </button>
                  ) : (
                    <div className="classroom-completed-badge">
                      <Award size={16} /> ¡Sección completada!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="classroom-empty-player">
                <p>No se encontraron clips de video asignados a esta clase.</p>
              </div>
            )}
          </div>

          {/* Lista de reproducción lateral */}
          <div className="classroom-playlist-area">
            <div className="playlist-card">
              <div className="playlist-header">
                <h3>Contenido de la clase</h3>
                <span className="playlist-progress-text">
                  {watchedClips.size} de {clips.length} vistos
                </span>
              </div>
              
              <ul className="playlist-list">
                {clips.map((clip, index) => {
                  const isActive = selectedClip?.clip_id === clip.clip_id;
                  const isWatched = watchedClips.has(clip.clip_id);
                  
                  return (
                    <li 
                      key={clip.clip_id}
                      className={`playlist-item ${isActive ? 'playlist-item--active' : ''}`}
                      onClick={() => setSelectedClip(clip)}
                    >
                      <div className="playlist-item-icon">
                        {clip.media_type === 'image' ? <ImageIcon size={16} /> : <Film size={16} />}
                      </div>
                      
                      <div className="playlist-item-info">
                        <span className="playlist-item-title">Parte {clip.part_number}</span>
                        <span className="playlist-item-type">
                          {clip.media_type === 'image' ? 'Referencia Estática' : 'Video Tutorial'}
                        </span>
                      </div>

                      {isWatched && (
                        <div className="playlist-item-status" title="Completado">
                          <CheckCircle size={16} className="status-checked-icon" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Notificaciones flotantes tipo Toast */}
        {toastMessage && (
          <div className="classroom-toast">
            <Sparkles size={16} />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default ClassroomPage;
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import Sidebar, { STAFF_NAV_ITEMS } from '../../components/Sidebar/Sidebar';
import RegisterChoreographyForm from '../../components/RegisterChoreographyForm/RegisterChoreographyForm';
import ChoreographyTable from '../../components/ChoreographyTable/ChoreographyTable';
import { getUserRoleFromToken } from '../../utils/auth';
import './RegisterChoreographyPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EMPTY_FORM = { song_name: '', genre: 'Salsa', genre_other: '', difficulty_level: 'Principiante', lead_dancer: '', guest_dancer: '', price: '', description: '', image_file: null };
const EMPTY_CLIP = { part_number: 1, video_file: null, video_url: null };

function RegisterChoreographyPage() {
  const navigate = useNavigate();
  const role = getUserRoleFromToken(localStorage.getItem("access_token")) ?? localStorage.getItem("role");
  const isDirector = role === 'director';

  const [choreographies, setChoreographies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [clips, setClips] = useState([{ ...EMPTY_CLIP }]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);
  const [teacherOptions, setTeacherOptions] = useState([]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    return fetch(url, { 
      ...options, 
      headers: { 
        ...(options.headers || {}), 
        Authorization: `Bearer ${token}` 
      } 
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/choreographies/?user_only=true`);
      const data = await res.json();
      setChoreographies(Array.isArray(data) ? data : data.results || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadData();
    if (isDirector) {
      fetchWithAuth(`${API_BASE_URL}/api/users/internal/?role=teacher`)
        .then(res => res.json())
        .then(data => setTeacherOptions(data.results || []));
    }
  }, [loadData, isDirector, fetchWithAuth]);

  const validate = () => {
    const newErrors = {};
    if (!form.song_name.trim()) newErrors.song_name = 'El nombre es obligatorio';
    if (!form.price || form.price <= 0) newErrors.price = 'Precio inválido';
    if (isDirector && !form.lead_dancer) newErrors.lead_dancer = 'Selecciona un profesor';
    const clipErrors = clips.some(c => !c.video_file && !c.video_url);
    if (clipErrors) newErrors.clips = 'Todos los clips deben tener un video';
    return newErrors;
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setForm(EMPTY_FORM);
    setClips([{ ...EMPTY_CLIP }]);
    setErrors({});
    setStatus('idle');
    setServerError(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (ch) => {
    setIsEditing(true);
    setEditingId(ch.choreography_id);
    setForm({
      song_name: ch.song_name,
      genre: ch.genre,
      genre_other: '',
      difficulty_level: ch.difficulty_level,
      lead_dancer: ch.creator || '',
      guest_dancer: ch.guest_dancer || '',
      price: ch.price,
      description: ch.description || '',
      image_file: null
    });
    setClips(ch.video_clips.map(vc => ({
      part_number: vc.part_number,
      video_file: null,
      video_url: vc.video_url
    })));
    setErrors({});
    setServerError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta coreografía?")) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/choreographies/${id}/`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) { console.error(err); }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setServerError(null);
    setStatus('loading');

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    try {
      let finalImageUrl = isEditing ? choreographies.find(c => c.choreography_id === editingId)?.thumbnail_url : "";
      if (form.image_file instanceof File) {
        setServerError("Subiendo imagen...");
        const imgData = new FormData();
        imgData.append("file", form.image_file);
        imgData.append("upload_preset", uploadPreset);
        const imgRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: imgData });
        const imgResult = await imgRes.json();
        finalImageUrl = imgResult.secure_url;
      }

      const uploadedClips = [];
      for (const clip of clips) {
        if (clip.video_file instanceof File) {
          setServerError(`Subiendo video parte ${clip.part_number}...`);
          const vidData = new FormData();
          vidData.append("file", clip.video_file);
          vidData.append("upload_preset", uploadPreset);
          const vidRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, { method: "POST", body: vidData });
          const vidResult = await vidRes.json();
          uploadedClips.push({ part_number: parseInt(clip.part_number, 10), video_url: vidResult.secure_url });
        } else {
          uploadedClips.push({ part_number: parseInt(clip.part_number, 10), video_url: clip.video_url });
        }
      }

      const payload = {
        song_name: form.song_name.trim(),
        genre: form.genre === "Otro" ? form.genre_other.trim() : form.genre,
        difficulty_level: form.difficulty_level,
        price: parseFloat(form.price),
        description: form.description,
        thumbnail_url: finalImageUrl,
        video_clips: uploadedClips,
        is_active: true,
      };

      const response = await fetchWithAuth(
        isEditing ? `${API_BASE_URL}/api/academy/choreographies/${editingId}/` : `${API_BASE_URL}/api/academy/choreographies/`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        handleCloseModal();
        loadData();
      } else {
        const data = await response.json();
        setServerError(data.detail || "Error en el servidor");
        setStatus("idle");
      }
    } catch (err) {
      setServerError(err.message);
      setStatus("idle");
    }
  };

  if (role !== 'teacher' && role !== 'director' && role !== 'admin') return <div>Acceso denegado</div>;

  return (
    <div className="admin-layout">
      <Sidebar userName="Usuario" userRole={isDirector ? 'Director' : 'Profesor'} navItems={STAFF_NAV_ITEMS} />
      <main className="admin-main">
        <div className="admin-content">
          <div className="admin-header">
            <div>
              <h1 className="admin-header__title">Mis Coreografías</h1>
              <p className="admin-header__subtitle">Gestiona tus clases y videos subidos.</p>
            </div>
            <button className="admin-btn admin-btn--primary" onClick={handleOpenModal}>
              <Plus size={16} /> Registrar coreografía
            </button>
          </div>

          <ChoreographyTable 
            choreographies={choreographies} 
            loading={loading} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick}
          />
        </div>

        {isModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal--lg">
              <button className="admin-modal__close" onClick={handleCloseModal}><X size={20} /></button>
              <RegisterChoreographyForm
                form={form}
                onFormChange={(f) => (e) => setForm({...form, [f]: e.target.value})}
                clips={clips}
                onClipChange={(idx, f, val) => {
                  const newClips = [...clips];
                  newClips[idx][f] = val;
                  setClips(newClips);
                }}
                onAddClip={() => setClips([...clips, { part_number: clips.length + 1, video_file: null, video_url: null }])}
                onRemoveClip={(idx) => setClips(clips.filter((_, i) => i !== idx))}
                status={status}
                serverError={serverError}
                onSubmit={handleSubmit}
                showLeadDancerSelect={isDirector}
                teacherOptions={teacherOptions}
                errors={errors}
                submitText={isEditing ? "Actualizar coreografía" : "Registrar coreografía"}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RegisterChoreographyPage;
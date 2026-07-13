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
const EMPTY_CLIP = { part_number: 1, video_file: null };

function RegisterChoreographyPage() {
  const navigate = useNavigate();
  const role = getUserRoleFromToken(localStorage.getItem("access_token")) ?? localStorage.getItem("role");
  const isDirector = role === 'director';

  const [choreographies, setChoreographies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/choreographies/`);
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

  // Validación local antes de enviar
  const validate = () => {
    const newErrors = {};
    if (!form.song_name.trim()) newErrors.song_name = 'El nombre es obligatorio';
    if (!form.price || form.price <= 0) newErrors.price = 'Precio inválido';
    if (isDirector && !form.lead_dancer) newErrors.lead_dancer = 'Selecciona un profesor';
    
    const clipErrors = clips.some(c => !c.video_file);
    if (clipErrors) newErrors.clips = 'Todos los clips deben tener un archivo de video';
    
    return newErrors;
  };

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setClips([{ ...EMPTY_CLIP }]);
    setErrors({});
    setStatus('idle');
    setIsModalOpen(true);
  };

  // Localiza esta función dentro de RegisterChoreographyPage.jsx y reemplázala:
const handleSubmit = async () => {
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setServerError(null);
  setStatus('loading');

  // Datos de configuración de Cloudinary
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
 
  console.log("DEBUG CLOUDINARY:", { cloudName, uploadPreset });
  
  try {
    let finalImageUrl = "";

    if (form.image_file) {
      setServerError("Subiendo imagen de portada...");
      const imgData = new FormData();
      imgData.append("file", form.image_file);
      imgData.append("upload_preset", uploadPreset);
      const imgRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: imgData,
      });
      const imgResult = await imgRes.json();
      finalImageUrl = imgResult.secure_url;
    }

    const uploadedClips = [];

    // 1. Iterar y subir cada archivo de video seleccionado a Cloudinary
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      
      // Creamos el FormData que requiere la API REST de Cloudinary
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", clip.video_file);
      cloudinaryData.append("upload_preset", uploadPreset);

      // Actualizamos el mensaje de estado para retroalimentar al cliente
      setServerError(`Subiendo video parte ${clip.part_number}...`); 

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: cloudinaryData,
        }
      );

      if (!cloudinaryResponse.ok) {
        const errData = await cloudinaryResponse.json();
        throw new Error(
          errData.error?.message || `Fallo al subir el clip número ${clip.part_number}`
        );
      }

      const uploadResult = await cloudinaryResponse.json();

      // Almacenamos la URL segura generada por Cloudinary y su número de orden
      uploadedClips.push({
        part_number: parseInt(clip.part_number, 10),
        video_url: uploadResult.secure_url, // URL HTTPS persistente del video
      });
    }

    // Limpiamos el mensaje temporal de subida
    setServerError(null);

    // 2. Construir el payload JSON esperado por Django
    const choreographyPayload = {
      song_name: form.song_name.trim(),
      genre: form.genre === "Otro" ? form.genre_other.trim() : form.genre,
      difficulty_level: form.difficulty_level,
      price: parseFloat(form.price),
      description: form.description,
      thumbnail_url: finalImageUrl,
      video_clips: uploadedClips,
      is_active: true,
    };

    if (form.guest_dancer) {
      choreographyPayload.guest_dancer = form.guest_dancer.trim();
    }

    // 3. Enviar los datos estructurados a Django
    const response = await fetchWithAuth(`${API_BASE_URL}/api/academy/choreographies/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(choreographyPayload),
    });

    if (response.ok) {
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      setClips([{ ...EMPTY_CLIP }]);
      loadData();
    } else {
      const data = await response.json();
      // Mostramos detalles del error de validación retornado por el backend si existen
      const details = data.detail || Object.values(data).flat().join(" | ");
      setServerError(details || "Error al registrar la coreografía en la academia.");
      setStatus("idle");
    }
  } catch (err) {
    setServerError(err.message || "Error en la conexión con los servicios.");
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
            onEdit={(c) => console.log("Editar", c)} 
            onDelete={(id) => console.log("Borrar", id)}
          />
        </div>

        {isModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal--lg">
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              <RegisterChoreographyForm
                form={form}
                onFormChange={(f) => (e) => setForm({...form, [f]: e.target.value})}
                clips={clips}
                onClipChange={(idx, f, val) => {
                  const newClips = [...clips];
                  newClips[idx][f] = val;
                  setClips(newClips);
                }}
                onAddClip={() => setClips([...clips, { part_number: clips.length + 1, video_file: null }])}
                onRemoveClip={(idx) => setClips(clips.filter((_, i) => i !== idx))}
                status={status}
                serverError={serverError}
                onSubmit={handleSubmit}
                showLeadDancerSelect={isDirector}
                teacherOptions={teacherOptions}
                errors={errors}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RegisterChoreographyPage;
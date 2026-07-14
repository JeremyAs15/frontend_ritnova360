import { useState, useEffect } from 'react';
import { Calendar, Clock, ShoppingBag, User } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import InputField from '../../components/InputField/InputField';
import Loader from '../../components/Loader/Loader';
import { useProfile } from '../../context/ProfileContext';
import './ProfilePage.css';

const DANCE_GENRES = ['Salsa', 'Bachata', 'Hip-Hop', 'Reggaetón', 'Zumba', 'Dancehall'];

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="profile-stat">
      <Icon size={16} className="profile-stat__icon" />
      <span className="profile-stat__label">{label}</span>
      <span className="profile-stat__value">{value}</span>
    </div>
  );
}

function ProfilePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, profileLoading, profileError, setProfile } = useProfile();
  const [stats, setStats] = useState({
    comprados: 0,
    horas: '0h',
    vistos: 0
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordForm, setPasswordForm] = useState({old_password: '', new_password: '', confirm_password: ''});
  const [isChangingPassword, setIsChangingPassword] = useState(false);


  useEffect(() => {
    if (!profile) return;

    if (profile.role === 'student') {
      const token = localStorage.getItem('access_token');
      fetch(`${import.meta.env.VITE_API_URL}/api/academy/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => (res.ok ? res.json() : null))
        .then(dashData => {
          if (dashData && dashData.kpis) {
            const totalVistos = dashData.kpis.videos_vistos || 0;
            // Estimación aproximada: cada video visto equivale a 0.5 horas (30 minutos) de estudio/práctica
            const horasCalculadas = (totalVistos * 0.5).toFixed(1);

            setStats({
              comprados: dashData.kpis.coreografias_compradas || 0,
              horas: `${horasCalculadas}h`,
              vistos: totalVistos
            });
          }
        })
        .catch(() => {});
    }
  }, [profile]);

  const handleEdit = () => {
    setForm({
      first_name:    profile.first_name    || '',
      last_name:     profile.last_name     || '',
      phone_number:  profile.phone_number  || '',
      birth_date:    profile.birth_date    || '',
      genre:         profile.genre         || '',
      document_type: profile.document_type || '',
      n_documento:   profile.n_documento   || '',
    });
    setSaveError(null);
    setSaveSuccess(false);
    setFormErrors({});
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({
      first_name:    profile.first_name    || '',
      last_name:     profile.last_name     || '',
      phone_number:  profile.phone_number  || '',
      birth_date:    profile.birth_date    || '',
      genre:         profile.genre         || '',
      document_type: profile.document_type || '',
      n_documento:   profile.n_documento   || '',
    });
    setPasswordForm({
    old_password: '',
    new_password: '',
    confirm_password: ''
    });
    setSaveError(null);
    setFormErrors({});
    setEditing(false);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.first_name?.trim()) newErrors.first_name = 'El nombre es obligatorio';
    if (!form.last_name?.trim()) newErrors.last_name = 'El apellido es obligatorio';
    if (!form.phone_number?.trim()) newErrors.phone_number = 'El teléfono es obligatorio';
    if (!form.birth_date) newErrors.birth_date = 'La fecha de nacimiento es obligatoria';
    if (!form.genre) newErrors.genre = 'Selecciona un género';
    if (!form.document_type) newErrors.document_type = 'Selecciona un tipo de documento';
    if (!form.n_documento?.trim()) newErrors.n_documento = 'El número de documento es obligatorio';
    return newErrors;
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) throw new Error('Sesión expirada, inicia sesión nuevamente');

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSaveError('Revisa los campos marcados.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      let token = localStorage.getItem('access_token');

      let res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        token = await refreshToken();
        res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Error al guardar los cambios');
      }

      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejar errores de validación del backend
        const errorMsg = data.old_password ? data.old_password[0] : 
                        data.confirm_password ? data.confirm_password[0] : 
                        'Error al cambiar la contraseña';
        throw new Error(errorMsg);
      }

      setSaveSuccess(true);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setIsChangingPassword(false);
    } catch (err) {
      setSaveError(err.message);
    }
  };


  if (profileError) return (
    <div className="loader-wrap loader-wrap--fullscreen">
      <p style={{ color: 'var(--alert-error-color)', fontSize: '1.05rem' }}>{profileError}</p>
    </div>
  );

  if (profileLoading || !profile) {
    return <Loader fullscreen label="Cargando perfil..." />;
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const joinDate = new Date(profile.date_joined).toLocaleDateString('es-CO');
  const { navItems, roleLabel } = getSidebarConfigForRole(profile.role);

  return (
    <div className="profile-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />

      <main className="profile-main">
        <div className="profile-page">

          {/* Encabezado */}
          <div className="profile-header">
            <h1 className="profile-header__title">Mi perfil</h1>
            <div className="profile-header__divider" />
          </div>

          <div className="profile-body">

            {/* Columna izquierda */}
            <div className="profile-left">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  <User size={52} strokeWidth={1.5} />
                </div>
                <div className="profile-avatar-ring" />
              </div>

              {/* Renderizar dinámicamente estadísticas reales del estudiante */}
              <div className="profile-stats">
                <StatCard icon={Calendar} label="Fecha de ingreso" value={joinDate} />
                {profile.role === 'student' && (
                  <>
                    <StatCard icon={Clock}       label="Horas de práctica" value={stats.horas} />
                    <StatCard icon={ShoppingBag} label="Cursos comprados"  value={stats.comprados} />
                  </>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="profile-right">

              {/* Alertas */}
              {saveError && (
                <div className="profile-alert profile-alert--error">{saveError}</div>
              )}
              {saveSuccess && (
                <div className="profile-alert profile-alert--success">
                  ✓ Perfil actualizado correctamente
                </div>
              )}

              {/* Datos personales */}
              <section className="profile-section">
                <div className="profile-section__title-row">
                  <User size={18} className="profile-section__icon" />
                  <h2 className="profile-section__title">Datos Personales</h2>
                </div>

                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label className="profile-field__label">Nombres</label>
                    {editing ? (
                      <InputField
                        value={form.first_name}
                        onChange={e => setForm(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Tu nombre"
                        error={formErrors.first_name}
                      />
                    ) : (
                      <div className="profile-field__value">{profile.first_name}</div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Apellidos</label>
                    {editing ? (
                      <InputField
                        value={form.last_name}
                        onChange={e => setForm(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Tus apellidos"
                        error={formErrors.last_name}
                      />
                    ) : (
                      <div className="profile-field__value">{profile.last_name}</div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Correo electrónico</label>
                    <div className="profile-field__value profile-field__value--locked">
                      {profile.email}
                      <span className="profile-field__lock"></span>
                    </div>
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Teléfono</label>
                    {editing ? (
                      <InputField
                        value={form.phone_number}
                        onChange={e => setForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="Ej: 321 777 1114"
                        error={formErrors.phone_number}
                      />
                    ) : (
                      <div className="profile-field__value">{profile.phone_number || '—'}</div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Tipo de documento</label>
                    {editing ? (
                      <>
                        <select
                          className={`profile-field__input ${formErrors.document_type ? 'profile-field__input--error' : ''}`}
                          name="document_type"
                          value={form.document_type}
                          onChange={handleChange}
                        >
                          <option value="">Seleccionar</option>
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="NIT">NIT</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="PASSPORT">Pasaporte</option>
                        </select>
                        {formErrors.document_type && <span className="profile-field__error">{formErrors.document_type}</span>}
                      </>
                    ) : (
                      <div className="profile-field__value">{profile.document_type || '—'}</div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Número de documento</label>
                    {editing ? (
                      <InputField
                        value={form.n_documento}
                        onChange={e => setForm(prev => ({ ...prev, n_documento: e.target.value }))}
                        placeholder="Ej: 1234567890"
                        error={formErrors.n_documento}
                      />
                    ) : (
                      <div className="profile-field__value">{profile.n_documento || '—'}</div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Fecha de nacimiento</label>
                    {editing ? (
                      <>
                        <input
                          className={`profile-field__input ${formErrors.birth_date ? 'profile-field__input--error' : ''}`}
                          name="birth_date"
                          type="date"
                          value={form.birth_date}
                          onChange={handleChange}
                        />
                        {formErrors.birth_date && <span className="profile-field__error">{formErrors.birth_date}</span>}
                      </>
                    ) : (
                      <div className="profile-field__value">{profile.birth_date || '—'}</div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label className="profile-field__label">Género</label>
                    {editing ? (
                      <>
                        <select
                          className={`profile-field__input ${formErrors.genre ? 'profile-field__input--error' : ''}`}
                          name="genre"
                          value={form.genre}
                          onChange={handleChange}
                        >
                          <option value="">Seleccionar</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="No binario">No binario</option>
                          <option value="Prefiero no decir">Prefiero no decir</option>
                        </select>
                        {formErrors.genre && <span className="profile-field__error">{formErrors.genre}</span>}
                      </>
                    ) : (
                      <div className="profile-field__value">{profile.genre || '—'}</div>
                    )}
                  </div>
                </div>
              </section>
              {/* Sección de Seguridad */}
              <section className="profile-section">
                <div className="profile-section__title-row">
                  <User size={18} className="profile-section__icon" />
                  <h2 className="profile-section__title">Seguridad</h2>
                </div>

                <div className="profile-password-container">
                  {!editing ? (
                    <div className="profile-field">
                      <label className="profile-field__label">Contraseña</label>
                      <div className="profile-field__value profile-field__value--locked">
                        ••••••••••••
                        <span className="profile-field__lock"></span>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-password-form">
                      <p className="profile-password-form__subtitle">Cambiar contraseña</p>
                      <div className="profile-form-grid">
                        <div className="profile-field">
                          <label className="profile-field__label">Contraseña actual</label>
                          <input
                            type="password"
                            className="profile-field__input"
                            value={passwordForm.old_password}
                            onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                            placeholder="Introduce tu clave actual"
                          />
                        </div>
                        <div className="profile-field">
                          <label className="profile-field__label">Nueva contraseña</label>
                          <input
                            type="password"
                            className="profile-field__input"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                            placeholder="Mínimo 6 caracteres"
                          />
                        </div>
                        <div className="profile-field">
                          <label className="profile-field__label">Confirmar nueva contraseña</label>
                          <input
                            type="password"
                            className="profile-field__input"
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                            placeholder="Repite la nueva clave"
                          />
                        </div>
                      </div>
                      
                      <button 
                        className="profile-btn--password-update" 
                        onClick={handleChangePassword}
                        disabled={saving || !passwordForm.old_password}
                      >
                        {saving ? 'Procesando...' : 'Actualizar Contraseña'}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Acciones */}
          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  className="profile-btn--cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="profile-btn--edit"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <button className="profile-btn--edit" onClick={handleEdit}>
                Editar
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
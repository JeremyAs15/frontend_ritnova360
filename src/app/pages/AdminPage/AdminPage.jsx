import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, CheckCircle, XCircle, X, Eye, EyeOff } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import UsersTable from '../../components/UsersTable/UsersTable';
import UsersFilters from '../../components/UsersFilters/UsersFilters';
import Loader from '../../components/Loader/Loader';
import { useProfile } from '../../context/ProfileContext';
import './AdminPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ═══════════════════════════════════════════
   AdminUsers
═══════════════════════════════════════════ */
function AdminUsers({ fetchWithAuth, currentRole }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('todos');
  const [statusF, setStatusF] = useState('todos');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const loadingTimerRef = useRef(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'teacher', status: 'activo', password: '', confirmPassword: '', birth_date: '', phone_number: '', genre: '', document_type: '', n_documento: '' });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'teacher' });
  const [editErrors, setEditErrors] = useState({});
  const [editFeedback, setEditFeedback] = useState(null);
  const [editServerLoading, setEditServerLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteServerLoading, setDeleteServerLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); }, []);

  const normalizeUser = useCallback((user) => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    email: user.email,
    role: user.role,
    status: user.is_active ? 'activo' : 'inactivo',
    createdAt: user.date_joined?.slice(0, 10) || '',
  }), []);

  const triggerLoading = () => {
    setLoading(true);
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => setLoading(false), 350);
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchUsers = async () => {
      setLoading(true);
      setServerError(null);
      try {
        const collectedUsers = [];
        let nextUrl = `${API_BASE_URL}/api/users/internal/`;
        while (nextUrl && !abortController.signal.aborted) {
          const response = await fetchWithAuth(nextUrl, { signal: abortController.signal });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'No se pudo cargar la lista de usuarios.');
          const results = Array.isArray(data) ? data : (data.results || []);
          collectedUsers.push(...results.map(normalizeUser));
          nextUrl = data.next;
        }
        setUsers(collectedUsers);
      } catch (error) {
        if (error.name !== 'AbortError') setServerError(error.message || 'Error de conexión.');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };
    fetchUsers();
    return () => abortController.abort();
  }, [fetchWithAuth, normalizeUser]);

  const validate = () => {
    const e = {};
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!form.email.trim()) e.email = 'El correo es obligatorio.';
    else if (!re.test(form.email)) e.email = 'Ingresa un correo válido.';
    if (!form.role) e.role = 'Selecciona un rol.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (!form.confirmPassword) e.confirmPassword = 'Confirma la contraseña.';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Las contraseñas no coinciden.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateEdit = () => {
    const e = {};
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!editForm.email.trim()) e.email = 'El correo es obligatorio.';
    else if (!re.test(editForm.email)) e.email = 'Ingresa un correo válido.';
    if (!editForm.role) e.role = 'Selecciona un rol.';
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm({ name: '', email: '', role: 'teacher', status: 'activo', password: '', confirmPassword: '', birth_date: '', phone_number: '', genre: '', document_type: '', n_documento: '' });
    setErrors({});
    setFeedback(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditErrors({});
    setEditFeedback(null);
    setEditFormOpen(true);
  };

  const closeEditForm = () => {
    setEditFormOpen(false);
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: 'teacher' });
    setEditErrors({});
    setEditFeedback(null);
  };

  const handleSubmit = async () => {
    if (!validate()) { setFeedback({ type: 'error', text: 'Revisa los campos marcados.' }); return; }
    setFeedback(null);
    setServerLoading(true);
    try {
      const [first_name, ...lastParts] = form.name.trim().split(' ');
      const last_name = lastParts.join(' ') || 'Apellido';
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/internal/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name, last_name,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          birth_date: form.birth_date || null,
          phone_number: form.phone_number || '',
          genre: form.genre || '',
          document_type: form.document_type || '',
          n_documento: form.n_documento || '',
        }),
      });
      const data = await res.json();
      if (res.ok) { setUsers(prev => [...prev, normalizeUser(data)]); closeForm(); showToast('success', 'Usuario creado con éxito.'); }
      else { setFeedback({ type: 'error', text: Object.values(data).flat().join(' | ') || 'Error al crear.' }); }
    } catch { setFeedback({ type: 'error', text: 'Error de conexión.' }); }
    finally { setServerLoading(false); }
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) { setEditFeedback({ type: 'error', text: 'Revisa los campos marcados.' }); return; }
    setEditFeedback(null);
    setEditServerLoading(true);
    try {
      const [first_name, ...lastParts] = editForm.name.trim().split(' ');
      const last_name = lastParts.join(' ') || 'Apellido';
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${editingUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email: editForm.email.trim().toLowerCase(), role: editForm.role, is_active: editingUser.status === 'activo' }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: `${data.first_name || ''} ${data.last_name || ''}`.trim(), email: data.email, role: data.role, status: data.is_active ? 'activo' : 'inactivo' } : u));
        closeEditForm();
        showToast('success', 'Usuario actualizado con éxito.');
      } else { setEditFeedback({ type: 'error', text: Object.values(data).flat().join(' | ') || 'Error al actualizar.' }); }
    } catch { setEditFeedback({ type: 'error', text: 'Error de conexión.' }); }
    finally { setEditServerLoading(false); }
  };

  const triggerDeleteConfirm = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) { setUserToDelete(user); setDeleteConfirmOpen(true); }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteServerLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${userToDelete.id}/`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userToDelete.id ? { ...u, status: 'inactivo' } : u));
        showToast('success', 'Usuario desactivado con éxito.');
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      } else { showToast('error', 'Error al eliminar el usuario.'); }
    } catch { showToast('error', 'Error de conexión.'); }
    finally { setDeleteServerLoading(false); }
  };

  const filtered = useMemo(() => users.filter(u =>
    (roleF === 'todos' || u.role === roleF) &&
    (statusF === 'todos' || u.status === statusF) &&
    (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
  ), [users, q, roleF, statusF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-content">

      {/* Encabezado */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Usuarios</h1>
          <p className="admin-header__subtitle">
            Administra administradores, directores, profesores y estudiantes · {filtered.length}
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {serverError && (
        <div className="admin-alert admin-alert--error">{serverError}</div>
      )}

      <UsersFilters
        q={q} roleF={roleF} statusF={statusF}
        onSearchChange={e => { triggerLoading(); setPage(1); setQ(e.target.value); }}
        onRoleChange={e => { triggerLoading(); setPage(1); setRoleF(e.target.value); }}
        onStatusChange={e => { triggerLoading(); setPage(1); setStatusF(e.target.value); }}
      />

      <UsersTable
        users={paginatedUsers}
        loading={loading}
        emptyMessage={q || roleF !== 'todos' || statusF !== 'todos' ? 'No se encontraron usuarios con esos filtros.' : 'Aún no hay usuarios registrados.'}
        canEdit={currentRole === 'admin' || currentRole === 'director'}
        canDelete={currentRole === 'admin' || currentRole === 'director'}
        onEditUser={openEditForm}
        onDeleteUser={triggerDeleteConfirm}
      />

      {/* Paginación */}
      <div className="admin-pagination">
        <p className="admin-pagination__info">
          Mostrando {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
        </p>
        <div className="admin-pagination__controls">
          <button className="pagination__btn" onClick={() => setPage(c => Math.max(1, c - 1))} disabled={currentPage === 1 || loading}>← Anterior</button>
          <span className="admin-pagination__current">Página {currentPage} de {totalPages}</span>
          <button className="pagination__btn" onClick={() => setPage(c => Math.min(totalPages, c + 1))} disabled={currentPage === totalPages || loading}>Siguiente →</button>
        </div>
      </div>

      {/* Modal creación */}
      {formOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal__close" onClick={closeForm}><X size={20} /></button>
            <h2 className="admin-modal__title">Nuevo usuario interno</h2>

            {feedback && (
              <div className={`admin-alert ${feedback.type === 'success' ? 'admin-alert--success' : 'admin-alert--error'}`}>
                {feedback.text}
              </div>
            )}

            <div className="admin-modal__fields">
              <div className="admin-field">
                <label className="admin-field__label">Nombre completo</label>
                <input className="admin-field__input" type="text" value={form.name} onChange={e => setForm(c => ({ ...c, name: e.target.value }))} />
                {errors.name && <span className="admin-field__error">{errors.name}</span>}
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Correo</label>
                <input className="admin-field__input" type="email" value={form.email} onChange={e => setForm(c => ({ ...c, email: e.target.value }))} />
                {errors.email && <span className="admin-field__error">{errors.email}</span>}
              </div>
              <div className="admin-modal__grid">
                <div className="admin-field">
                  <label className="admin-field__label">Rol</label>
                  <select className="admin-field__input" value={form.role} onChange={e => setForm(c => ({ ...c, role: e.target.value }))}>
                    <option value="teacher">Profesor</option>
                    <option value="admin">Administrador</option>
                    <option value="director">Director</option>
                  </select>
                  {errors.role && <span className="admin-field__error">{errors.role}</span>}
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Estado</label>
                  <select className="admin-field__input" value={form.status} onChange={e => setForm(c => ({ ...c, status: e.target.value }))}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Fecha de nacimiento</label>
                  <input className="admin-field__input" type="date" value={form.birth_date} onChange={e => setForm(c => ({ ...c, birth_date: e.target.value }))} />
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Teléfono</label>
                  <input className="admin-field__input" type="tel" value={form.phone_number} placeholder="Ej: 321 777 1114" onChange={e => setForm(c => ({ ...c, phone_number: e.target.value }))} />
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Género</label>
                  <select className="admin-field__input" value={form.genre} onChange={e => setForm(c => ({ ...c, genre: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="No binario">No binario</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Tipo de documento</label>
                  <select className="admin-field__input" value={form.document_type} onChange={e => setForm(c => ({ ...c, document_type: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Número de documento</label>
                  <input className="admin-field__input" type="text" value={form.n_documento} placeholder="Ej: 1234567890" onChange={e => setForm(c => ({ ...c, n_documento: e.target.value }))} />
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Contraseña</label>
                  <div className="admin-field__password-wrap">
                    <input className="admin-field__input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(c => ({ ...c, password: e.target.value }))} />
                    <button type="button" className="admin-field__password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="admin-field__error">{errors.password}</span>}
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Confirmar contraseña</label>
                  <div className="admin-field__password-wrap">
                    <input className="admin-field__input" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm(c => ({ ...c, confirmPassword: e.target.value }))} />
                    <button type="button" className="admin-field__password-toggle" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="admin-field__error">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            <div className="admin-modal__actions">
              <button className="admin-btn admin-btn--ghost" onClick={closeForm}>Cancelar</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSubmit} disabled={serverLoading}>
                {serverLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {editFormOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal__close" onClick={closeEditForm}><X size={20} /></button>
            <h2 className="admin-modal__title">Editar usuario</h2>
            <p className="admin-modal__subtitle">{editingUser?.email}</p>

            {editFeedback && (
              <div className={`admin-alert ${editFeedback.type === 'success' ? 'admin-alert--success' : 'admin-alert--error'}`}>
                {editFeedback.text}
              </div>
            )}

            <div className="admin-modal__fields">
              <div className="admin-field">
                <label className="admin-field__label">Nombre completo</label>
                <input className="admin-field__input" type="text" value={editForm.name} onChange={e => setEditForm(c => ({ ...c, name: e.target.value }))} />
                {editErrors.name && <span className="admin-field__error">{editErrors.name}</span>}
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Correo</label>
                <input className="admin-field__input" type="email" value={editForm.email} onChange={e => setEditForm(c => ({ ...c, email: e.target.value }))} />
                {editErrors.email && <span className="admin-field__error">{editErrors.email}</span>}
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Rol</label>
                <select className="admin-field__input" value={editForm.role} onChange={e => setEditForm(c => ({ ...c, role: e.target.value }))}>
                  <option value="student">Estudiante</option>
                  <option value="teacher">Profesor</option>
                  <option value="admin">Administrador</option>
                  <option value="director">Director</option>
                </select>
                {editErrors.role && <span className="admin-field__error">{editErrors.role}</span>}
              </div>
            </div>

            <div className="admin-modal__actions">
              <button className="admin-btn admin-btn--ghost" onClick={closeEditForm}>Cancelar</button>
              <button className="admin-btn admin-btn--primary" onClick={handleEditSubmit} disabled={editServerLoading}>
                {editServerLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminación */}
      {deleteConfirmOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--sm">
            <button className="admin-modal__close" onClick={() => { setDeleteConfirmOpen(false); setUserToDelete(null); }}><X size={20} /></button>
            <div className="admin-delete-header">
              <div className="admin-delete-icon"><AlertTriangle size={24} /></div>
              <div>
                <h2 className="admin-modal__title">¿Eliminar usuario?</h2>
                <p className="admin-modal__subtitle">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="admin-delete-msg">
              ¿Estás seguro de que deseas eliminar a <strong>{userToDelete?.name}</strong>?
            </p>
            <div className="admin-modal__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => { setDeleteConfirmOpen(false); setUserToDelete(null); }} disabled={deleteServerLoading}>Cancelar</button>
              <button className="admin-btn admin-btn--danger" onClick={handleDeleteConfirm} disabled={deleteServerLoading}>
                {deleteServerLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type === 'success' ? 'admin-toast--success' : 'admin-toast--error'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   AdminPage — layout principal
═══════════════════════════════════════════ */
export default function AdminPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, profileLoading, profileError } = useProfile();

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    const response = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  }, []);

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  }, [navigate]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No hay sesión activa.');
    const doRequest = (t) => fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${t}` } });
    let response = await doRequest(token);
    if (response.status !== 401) return response;
    const refreshed = await refreshAccessToken();
    if (!refreshed) { redirectToLogin(); throw new Error('Sesión expirada.'); }
    response = await doRequest(refreshed);
    if (response.status === 401) { redirectToLogin(); throw new Error('Sesión expirada.'); }
    return response;
  }, [redirectToLogin, refreshAccessToken]);

  if (profileLoading && !profile && !profileError) {
    return <Loader fullscreen label="Cargando..." />;
  }

  const { navItems, roleLabel } = getSidebarConfigForRole(profile?.role);
  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email : 'Usuario';

  return (
    <div className="admin-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />
      <main className="admin-main">
        <AdminUsers fetchWithAuth={fetchWithAuth} currentRole={profile?.role} />
      </main>
    </div>
  );
}
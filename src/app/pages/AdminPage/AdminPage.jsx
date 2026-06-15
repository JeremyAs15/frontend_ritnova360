import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Settings, LogOut, Music2, Plus, Menu, Trash2, AlertTriangle } from 'lucide-react';
import UsersTable from '../../components/UsersTable/UsersTable';
import UsersFilters from '../../components/UsersFilters/UsersFilters';
import { getUserRoleFromToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AppSidebar({ collapsed, userName = 'Admin User' }) {
  const { pathname } = useLocation();
  const items = [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'Usuarios internos', url: '/admin/users', icon: Users },
    { title: 'Catálogo coreografías', url: '/admin/choreographies', icon: ClipboardList },
    { title: 'Panel servicios', url: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className={`border-r border-white/10 bg-[#111827] text-white flex flex-col ${collapsed ? 'w-20' : 'w-72'} transition-all`}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center font-bold">R</div>
          {!collapsed && (
            <div>
              <p className="font-semibold">Ritnova 360</p>
              <p className="text-xs text-white/60">Panel administrativo</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-3 flex-1">
        {!collapsed && <p className="px-3 pb-2 text-xs uppercase tracking-[0.2em] text-white/50">Navegación</p>}
        <div className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.url || (item.url !== '/admin' && pathname.startsWith(item.url));
            const Icon = item.icon;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? 'bg-white/10 font-semibold' : 'hover:bg-white/5 text-white/80'}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'}`}>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center font-bold">
            {userName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-xs text-white/50">admin</p>
            </div>
          )}
          {!collapsed && (
            <NavLink to="/login" className="text-white/60 hover:text-white">
              <LogOut className="h-4 w-4" />
            </NavLink>
          )}
        </div>
      </div>
    </aside>
  );
}

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('todos');
  const [statusF, setStatusF] = useState('todos');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const loadingTimerRef = useRef(null);

  // — Estado modal creación —
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'teacher',
    status: 'activo',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [serverLoading, setServerLoading] = useState(false);

  // — Estado modal edición (AB-130) —
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'teacher',
    status: 'activo',
  });
  const [editErrors, setEditErrors] = useState({});
  const [editFeedback, setEditFeedback] = useState(null);
  const [editServerLoading, setEditServerLoading] = useState(false);

  const [currentRole] = useState(() => getUserRoleFromToken(localStorage.getItem('access_token')) ?? 'admin');

  // — Estado modal eliminación —
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteServerLoading, setDeleteServerLoading] = useState(false);

  // — Estado de Notificaciones Toast —
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const triggerDeleteConfirm = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteServerLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${userToDelete.id}/`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers((current) => current.map((u) => u.id === userToDelete.id ? { ...u, status: 'inactivo' } : u));
        showToast('success', 'Usuario desactivado con éxito.');
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      } else {
        let errMsg = 'Error al eliminar el usuario.';
        try {
          const data = await res.json();
          errMsg = Object.values(data).flat().join(' | ') || errMsg;
        } catch {
          // No JSON body
        }
        showToast('error', errMsg);
      }
    } catch (error) {
      showToast('error', 'Error de conexión con el servidor.');
    } finally {
      setDeleteServerLoading(false);
    }
  };
  // — Helpers modal creación —
  const closeForm = () => {
    setFormOpen(false);
    setForm({ name: '', email: '', role: 'teacher', status: 'activo', password: '', confirmPassword: '' });
    setErrors({});
    setFeedback(null);
  };

  // — Helpers modal edición (AB-130) —
  const openEditForm = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
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

  const normalizeUser = useCallback((user) => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    email: user.email,
    role: user.role,
    status: user.is_active ? 'activo' : 'inactivo',
    createdAt: user.date_joined?.slice(0, 10) || '',
  }), []);

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
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

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');

    const doRequest = (accessToken) => fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
    });

    let response = await doRequest(token);
    if (response.status !== 401) return response;

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      redirectToLogin();
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    response = await doRequest(refreshedToken);
    if (response.status === 401) {
      redirectToLogin();
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return response;
  }, [redirectToLogin, refreshAccessToken]);

  const triggerLoading = () => {
    setLoading(true);
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => setLoading(false), 350);
  };

  const validate = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) nextErrors.name = 'El nombre completo es obligatorio.';
    if (!form.email.trim()) nextErrors.email = 'El correo es obligatorio.';
    else if (!emailRegex.test(form.email)) nextErrors.email = 'Ingresa un correo válido.';
    if (!form.role) nextErrors.role = 'Selecciona un rol.';
    if (!form.status) nextErrors.status = 'Selecciona un estado.';
    if (!form.password) nextErrors.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8) nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirma la contraseña.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Las contraseñas no coinciden.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateEdit = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!editForm.name.trim()) nextErrors.name = 'El nombre completo es obligatorio.';
    if (!editForm.email.trim()) nextErrors.email = 'El correo es obligatorio.';
    else if (!emailRegex.test(editForm.email)) nextErrors.email = 'Ingresa un correo válido.';
    if (!editForm.role) nextErrors.role = 'Selecciona un rol.';

    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
        if (error.name !== 'AbortError') {
          setServerError(error.message || 'Error de conexión con el servidor.');
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchUsers();
    return () => abortController.abort();
  }, [fetchWithAuth, normalizeUser]);

  const handleSubmit = async () => {
    if (!validate()) {
      setFeedback({ type: 'error', text: 'Revisa los campos marcados antes de continuar.' });
      return;
    }

    setFeedback(null);
    setServerLoading(true);
    try {
      const [first_name, ...lastParts] = form.name.trim().split(' ');
      const last_name = lastParts.join(' ') || 'Apellido';
      const roleMap = { Profesor: 'teacher', Administrador: 'admin', Director: 'director' };

      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/internal/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: roleMap[form.role] || form.role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => [...prev, { ...normalizeUser(data) }]);
        closeForm();
        showToast('success', 'Usuario creado con éxito.');
      } else {
        const msg = Object.values(data).flat().join(' | ');
        setFeedback({ type: 'error', text: msg || 'Error al crear el usuario.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setServerLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) {
      setEditFeedback({ type: 'error', text: 'Revisa los campos marcados antes de continuar.' });
      return;
    }

    setEditFeedback(null);
    setEditServerLoading(true);
    try {
      const [first_name, ...lastParts] = editForm.name.trim().split(' ');
      const last_name = lastParts.join(' ') || 'Apellido';

      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${editingUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email: editForm.email.trim().toLowerCase(),
          role: editForm.role,
          is_active: editingUser.status === 'activo',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === editingUser.id ? {
          ...u,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email,
          role: data.role,
          status: data.is_active ? 'activo' : 'inactivo',
        } : u));
        closeEditForm();
        showToast('success', 'Usuario actualizado con éxito.');
      } else {
        const msg = Object.values(data).flat().join(' | ');
        setEditFeedback({ type: 'error', text: msg || 'Error al actualizar el usuario.' });
      }
    } catch {
      setEditFeedback({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setEditServerLoading(false);
    }
  };


  const filtered = useMemo(() => users.filter((u) => {
    return (roleF === 'todos' || u.role === roleF)
      && (statusF === 'todos' || u.status === statusF)
      && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  }), [users, q, roleF, statusF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearchChange = (e) => { triggerLoading(); setPage(1); setQ(e.target.value); };
  const handleRoleChange = (e) => { triggerLoading(); setPage(1); setRoleF(e.target.value); };
  const handleStatusChange = (e) => { triggerLoading(); setPage(1); setStatusF(e.target.value); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Usuarios internos</h1>
          <p className="mt-1 text-sm text-slate-500">Administra administradores, directores y profesores · {filtered.length}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg"
          onClick={() => setFormOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      {serverError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {/* Modal creación */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" style={{ animation: 'overlay-fade 180ms ease-out' }}>
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#faf6f1] p-6 shadow-2xl ring-1 ring-black/10" style={{ animation: 'modal-pop 220ms ease-out' }}>
            <button
              type="button"
              onClick={closeForm}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-500 hover:bg-black/5 hover:text-slate-700"
              aria-label="Cerrar formulario"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6 pr-8">
              <div>
                <h2 className="text-2xl font-medium text-slate-900">Nuevo usuario interno</h2>
              </div>

              {feedback && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                  {feedback.text}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Nombre completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                  />
                  {errors.name && <p className="text-sm text-rose-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Correo</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                  />
                  {errors.email && <p className="text-sm text-rose-600">{errors.email}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-base font-medium text-slate-800">Rol</label>
                    <div className="relative">
                      <select
                        value={form.role}
                        onChange={(e) => setForm((c) => ({ ...c, role: e.target.value }))}
                        className="h-12 w-full appearance-none rounded-2xl border border-[#eadfd4] bg-white px-4 pr-11 text-slate-900 outline-none transition focus:border-orange-300"
                      >
                        <option value="teacher">Profesor</option>
                        <option value="admin">Administrador</option>
                        <option value="director">Director</option>
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                    {errors.role && <p className="text-sm text-rose-600">{errors.role}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium text-slate-800">Estado</label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}
                        className="h-12 w-full appearance-none rounded-2xl border border-[#eadfd4] bg-white px-4 pr-11 text-slate-900 outline-none transition focus:border-orange-300"
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                    {errors.status && <p className="text-sm text-rose-600">{errors.status}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium text-slate-800">Contraseña</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                    />
                    {errors.password && <p className="text-sm text-rose-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium text-slate-800">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                    />
                    {errors.confirmPassword && <p className="text-sm text-rose-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  onClick={handleSubmit}
                  disabled={serverLoading}
                  style={{ opacity: serverLoading ? 0.7 : 1, cursor: serverLoading ? 'not-allowed' : 'pointer' }}
                >
                  {serverLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición — AB-130 */}
      {editFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" style={{ animation: 'overlay-fade 180ms ease-out' }}>
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#faf6f1] p-6 shadow-2xl ring-1 ring-black/10" style={{ animation: 'modal-pop 220ms ease-out' }}>
            <button
              type="button"
              onClick={closeEditForm}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-500 hover:bg-black/5 hover:text-slate-700"
              aria-label="Cerrar formulario"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6 pr-8">
              <div>
                <h2 className="text-2xl font-medium text-slate-900">Editar usuario</h2>
                <p className="mt-1 text-sm text-slate-500">{editingUser?.email}</p>
              </div>

              {editFeedback && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${editFeedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                  {editFeedback.text}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Nombre completo</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((c) => ({ ...c, name: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                  />
                  {editErrors.name && <p className="text-sm text-rose-600">{editErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Correo</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((c) => ({ ...c, email: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                  />
                  {editErrors.email && <p className="text-sm text-rose-600">{editErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Rol</label>
                  <div className="relative">
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((c) => ({ ...c, role: e.target.value }))}
                      className="h-12 w-full appearance-none rounded-2xl border border-[#eadfd4] bg-white px-4 pr-11 text-slate-900 outline-none transition focus:border-orange-300"
                    >
                      <option value="teacher">Profesor</option>
                      <option value="admin">Administrador</option>
                      <option value="director">Director</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  {editErrors.role && <p className="text-sm text-rose-600">{editErrors.role}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  onClick={handleEditSubmit}
                  disabled={editServerLoading}
                  style={{ opacity: editServerLoading ? 0.7 : 1, cursor: editServerLoading ? 'not-allowed' : 'pointer' }}
                >
                  {editServerLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UsersFilters
        q={q}
        roleF={roleF}
        statusF={statusF}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
      />

      <UsersTable
        users={paginatedUsers}
        loading={loading}
        emptyMessage={q || roleF !== 'todos' || statusF !== 'todos'
          ? 'No se encontraron usuarios con esos filtros.'
          : 'Aún no hay usuarios registrados.'}
        canEdit={currentRole === 'admin' || currentRole === 'director'}
        canDelete={currentRole === 'admin' || currentRole === 'director'}
        onEditUser={openEditForm}
        onDeleteUser={triggerDeleteConfirm}
      />

      <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Mostrando {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((c) => Math.max(1, c - 1))}
            disabled={currentPage === 1 || loading}
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">Página {currentPage} de {totalPages}</span>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal confirmación de eliminación */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" style={{ animation: 'overlay-fade 180ms ease-out' }}>
          <div className="relative w-full max-w-md rounded-3xl bg-[#faf6f1] p-6 shadow-2xl ring-1 ring-black/10" style={{ animation: 'modal-pop 220ms ease-out' }}>
            <button
              type="button"
              onClick={() => { setDeleteConfirmOpen(false); setUserToDelete(null); }}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-500 hover:bg-black/5 hover:text-slate-700"
              aria-label="Cerrar confirmación"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">¿Eliminar usuario?</h2>
                  <p className="text-xs text-slate-500">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  ¿Estás seguro de que deseas eliminar a <strong className="text-slate-900 font-semibold">{userToDelete?.name}</strong>?
                </p>
                <p className="text-xs text-slate-400">
                  Se eliminará su cuenta y perderá el acceso a la plataforma.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmOpen(false); setUserToDelete(null); }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  disabled={deleteServerLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition"
                  disabled={deleteServerLoading}
                  style={{ opacity: deleteServerLoading ? 0.7 : 1, cursor: deleteServerLoading ? 'not-allowed' : 'pointer' }}
                >
                  {deleteServerLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ${toast.type === 'success'
            ? 'border-emerald-500/20 bg-emerald-500/90 text-white'
            : 'border-rose-500/20 bg-rose-500/90 text-white'
            }`}
          style={{ animation: 'toast-slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {toast.type === 'success' ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-rose-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 9v4M12 17h.01" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          )}
          <p className="text-sm font-semibold">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

const animationStyles = `
  @keyframes overlay-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-pop {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes toast-slide-up {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('admin-modal-animations')) {
  const style = document.createElement('style');
  style.id = 'admin-modal-animations';
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar collapsed={collapsed} />
        <main className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <button onClick={() => setCollapsed((v) => !v)} className="rounded-xl p-2 hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Music2 className="h-4 w-4 text-orange-500" /> Panel administrativo
            </div>
          </header>
          <div className="p-6">
            <AdminUsers />
          </div>
        </main>
      </div>
    </div>
  );
}
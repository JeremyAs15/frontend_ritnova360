import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Settings, LogOut, Music2, Search, Plus, Pencil, Trash2, Menu } from 'lucide-react';

/* Se establecen datos Hardcodeados para una vista inicial. 
 * TODO: Reemplazar con datos reales obtenidos desde el backend. 
*/
const seedUsers = [
  { id: 'u1', name: 'Ana García', email: 'ana@ritnova360.com', role: 'admin', status: 'activo', createdAt: '2026-01-15' },
  { id: 'u2', name: 'Luis Torres', email: 'luis@ritnova360.com', role: 'director', status: 'activo', createdAt: '2026-02-03' },
  { id: 'u3', name: 'María Pérez', email: 'maria@ritnova360.com', role: 'teacher', status: 'inactivo', createdAt: '2026-02-21' },
  { id: 'u4', name: 'Carlos López', email: 'carlos@ritnova360.com', role: 'teacher', status: 'activo', createdAt: '2026-03-05' },
];

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
  const [users, setUsers] = useState(seedUsers);
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('todos');
  const [statusF, setStatusF] = useState('todos');
  const [formOpen, setFormOpen] = useState(false);
  // Formulario controlado para preparar la integración con backend.
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'teacher',
    status: 'activo',
    password: '',
    confirmPassword: '',
  });
  // Errores por campo mostrados directamente en el modal.
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  const closeForm = () => {
    setFormOpen(false);
    setForm({
      name: '',
      email: '',
      role: 'teacher',
      status: 'activo',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setFeedback(null);
  };

  // Validación ligera del cliente: obligatorios, email y contraseña.
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

  const handleSubmit = () => {
    if (!validate()) {
      setFeedback({ type: 'error', text: 'Revisa los campos marcados antes de continuar.' });
      return;
    }

    setFeedback({ type: 'success', text: 'Usuario listo para registrarse correctamente.' });
  };

  const filtered = useMemo(() => users.filter((u) => {
    return (roleF === 'todos' || u.role === roleF)
      && (statusF === 'todos' || u.status === statusF)
      && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  }), [users, q, roleF, statusF]);

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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" style={{ animation: 'overlay-fade 180ms ease-out' }}>
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#faf6f1] p-6 shadow-2xl ring-1 ring-black/10" style={{ animation: 'modal-pop 220ms ease-out' }}>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-500 hover:bg-black/5 hover:text-slate-700"
              aria-label="Cerrar formulario"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6 pr-8">
              <div>
                <h2 className="text-2xl font-medium text-slate-900">Nuevo usuario interno</h2>
              </div>

              {feedback && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Nombre completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                  />
                  {errors.name && <p className="text-sm text-rose-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium text-slate-800">Correo</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
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
                        onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
                        className="h-12 w-full appearance-none rounded-2xl border border-[#eadfd4] bg-white px-4 pr-11 text-slate-900 outline-none transition focus:border-orange-300"
                      >
                        <option>Profesor</option>
                        <option>Administrador</option>
                        <option>Director</option>
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
                        onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
                        className="h-12 w-full appearance-none rounded-2xl border border-[#eadfd4] bg-white px-4 pr-11 text-slate-900 outline-none transition focus:border-orange-300"
                      >
                        <option>Activo</option>
                        <option>Inactivo</option>
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
                      onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-[#eadfd4] bg-white px-4 text-slate-900 outline-none transition focus:border-orange-300"
                    />
                    {errors.password && <p className="text-sm text-rose-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium text-slate-800">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
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
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nombre o correo..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 outline-none focus:border-orange-400"
            />
          </div>
          <select value={roleF} onChange={(e) => setRoleF(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-orange-400">
            <option value="todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="director">Director</option>
            <option value="teacher">Profesor</option>
          </select>
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-orange-400">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Creado</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-700">{u.role}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.status === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        onClick={() => setUsers((current) => current.filter((user) => user.id !== u.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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

import { Search } from 'lucide-react';

function UsersFilters({ q, roleF, statusF, onSearchChange, onRoleChange, onStatusChange }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={onSearchChange}
            placeholder="Buscar nombre o correo..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 outline-none focus:border-orange-400"
          />
        </div>

        <select value={roleF} onChange={onRoleChange} className="rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-orange-400">
          <option value="todos">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="director">Director</option>
          <option value="teacher">Profesor</option>
          <option value="student">Estudiante</option>
        </select>

        <select value={statusF} onChange={onStatusChange} className="rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-orange-400">
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
    </section>
  );
}

export default UsersFilters;

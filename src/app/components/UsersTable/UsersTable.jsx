import { Pencil, Trash2 } from 'lucide-react';

function UsersTable({ users, loading = false, emptyMessage = 'No hay usuarios para mostrar.', onEditUser, onDeleteUser }) {
  return (
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
            {loading ? (
              <tr className="border-t border-slate-100">
                <td className="px-6 py-8 text-sm text-slate-500" colSpan={5}>
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr className="border-t border-slate-100">
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={5}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white">
                        {user.name.split(' ').map((name) => name[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-700">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        onClick={() => onEditUser?.(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        onClick={() => onDeleteUser?.(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UsersTable;

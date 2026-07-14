import { Eye, Pencil, Trash2, Film } from 'lucide-react';

function ChoreographyTable({ choreographies, loading, onView, onEdit, onDelete }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Coreografía</th>
              <th className="px-6 py-4 font-medium">Género</th>
              <th className="px-6 py-4 font-medium">Dificultad</th>
              <th className="px-6 py-4 font-medium">Clips</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Cargando coreografías...</td></tr>
            ) : choreographies.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No hay coreografías registradas.</td></tr>
            ) : (
              choreographies.map((ch) => (
                <tr key={ch.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{ch.song_name}</p>
                    {ch.guest_dancer && <p className="text-xs text-slate-500">Invitado: {ch.guest_dancer}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{ch.genre}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      {ch.difficulty_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Film size={14} /> {ch.video_clips?.length || 0} videos
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">${ch.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => onView(ch)} title="Ver video" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-orange-600">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(ch)} title="Editar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onDelete(ch.choreography_id)} title="Eliminar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                        <Trash2 size={16} />
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

export default ChoreographyTable;
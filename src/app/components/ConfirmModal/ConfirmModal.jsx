import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

/**
 * Modal de confirmación genérico, con el mismo estilado usado en el panel de administración.
 * Props:
 *  - open          {boolean}   Controla si el modal se renderiza
 *  - title         {string}    Título principal (ej. "¿Eliminar coreografía?")
 *  - subtitle      {string}    Texto pequeño bajo el título (por defecto "Esta acción no se puede deshacer")
 *  - message       {node}      Cuerpo del mensaje de confirmación
 *  - confirmLabel  {string}    Texto del botón de confirmar
 *  - cancelLabel   {string}    Texto del botón de cancelar
 *  - onConfirm     {function}  Callback al confirmar
 *  - onCancel      {function}  Callback al cancelar / cerrar
 *  - loading       {boolean}   Deshabilita los botones y cambia el texto de confirmar
 */
function ConfirmModal({
  open,
  title,
  subtitle = 'Esta acción no se puede deshacer',
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <button className="confirm-modal__close" onClick={onCancel} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="confirm-modal__header">
          <div className="confirm-modal__icon">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="confirm-modal__title">{title}</h2>
            <p className="confirm-modal__subtitle">{subtitle}</p>
          </div>
        </div>

        {message && <p className="confirm-modal__message">{message}</p>}

        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn confirm-modal__btn--ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className="confirm-modal__btn confirm-modal__btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

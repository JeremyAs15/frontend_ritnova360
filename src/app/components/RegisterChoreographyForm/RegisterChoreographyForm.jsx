import { Plus, Trash2, Upload } from 'lucide-react';
import InputField from '../InputField/InputField';
import '../../styles/forms.css';
import './RegisterChoreographyForm.css';

const DIFFICULTY_OPTIONS = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];
const GENRE_OPTIONS = ['Salsa', 'Bachata', 'Merengue', 'Reggaetón', 'Hip-Hop', 'Pop', 'Dancehall', 'Zumba', 'Otro'];

function RegisterChoreographyForm({
  form, onFormChange, clips, onClipChange, onAddClip, onRemoveClip,
  errors = {}, serverError = null, status = 'idle', onSubmit,
  showLeadDancerSelect = false, teacherOptions = [],
}) {
  return (
    <div className="form register-choreography-form">
      <h1 className="form__title">Registrar coreografía</h1>
      <p className="form__subtitle">Completa los datos y sube los videos de la coreografía.</p>

      <div className="admin-modal__grid">
          <InputField
            label="Nombre de la canción"
            value={form.song_name}
            onChange={onFormChange('song_name')}
            placeholder="Ej. Vivir Mi Vida"
            error={errors.song_name}
          />

          <InputField
            label="Precio (COP)"
            type="number"
            value={form.price}
            onChange={onFormChange('price')}
            placeholder="Ej. 100000"
            error={errors.price}
          />
      </div>

      <div className="admin-modal__grid">
          <div className="input-field">
            <label className="input-field__label">Género musical</label>
            <select className="admin-field__input" value={form.genre} onChange={onFormChange('genre')}>
                {GENRE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="input-field">
            <label className="input-field__label">Nivel</label>
            <select className="admin-field__input" value={form.difficulty_level} onChange={onFormChange('difficulty_level')}>
                {DIFFICULTY_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
      </div>

      {form.genre === 'Otro' && (
        <InputField
          label="Especifica el género"
          value={form.genre_other}
          onChange={onFormChange('genre_other')}
          error={errors.genre_other}
        />
      )}

      {showLeadDancerSelect && (
        <div className="input-field">
          <label className="input-field__label">Profesor bailarín principal</label>
          <select className="admin-field__input" value={form.lead_dancer} onChange={onFormChange('lead_dancer')}>
              <option value="">Selecciona un profesor...</option>
              {teacherOptions.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select>
          {errors.lead_dancer && <span className="input-field__error">{errors.lead_dancer}</span>}
        </div>
      )}

      <InputField
        label="Bailarín invitado (opcional)"
        value={form.guest_dancer}
        onChange={onFormChange('guest_dancer')}
        error={errors.guest_dancer}
      />

      <div className="input-field">
        <label className="input-field__label">
          Descripción de la coreografía
        </label>

        <textarea
          className="input-field__input"
          rows={3}
          value={form.description}
          onChange={onFormChange('description')}
          placeholder="Describe qué aprenderán los estudiantes..."
        />

        {errors.description && (
          <span className="input-field__error">
            {errors.description}
          </span>
        )}
      </div>

      <div className="input-field">
        <label className="input-field__label">
          Imagen de portada (Banner)
        </label>

        <div className="register-choreography-form__file-wrapper">
          <label className="register-choreography-form__file-label">
            <Upload size={16} />
            <span>
              {form.image_file
                ? form.image_file.name
                : "Subir imagen de portada"}
            </span>

            <input
              type="file"
              accept="image/*"
              className="register-choreography-form__file-hidden"
              onChange={(e) =>
                onFormChange("image_file")({
                  target: { value: e.target.files[0] },
                })
              }
            />
          </label>
        </div>
      </div>

      <div className="register-choreography-form__clips">
        <p className="register-choreography-form__clips-label">Clips de video (archivos mp4)</p>
        {clips.map((clip, index) => (
          <div className="register-choreography-form__clip-row" key={index}>
            <input
              className="input-field__input register-choreography-form__clip-part"
              type="number"
              value={clip.part_number}
              onChange={(e) => onClipChange(index, 'part_number', e.target.value)}
            />
            <div className="register-choreography-form__file-wrapper">
              <label className="register-choreography-form__file-label">
                <Upload size={16} />
                <span className="file-name-truncate">
                  {clip.video_file ? clip.video_file.name : "Seleccionar video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="register-choreography-form__file-hidden"
                  onChange={(e) => onClipChange(index, 'video_file', e.target.files[0])}
                />
              </label>
            </div>
            {clips.length > 1 && (
              <button type="button" className="clip-remove-btn" onClick={() => onRemoveClip(index)}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {errors.clips && <span className="input-field__error">{errors.clips}</span>}
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onAddClip} style={{marginTop: '10px'}}>
          <Plus size={14} /> Agregar parte
        </button>
      </div>

      {serverError && <div className="admin-alert admin-alert--error">{serverError}</div>}

      <div className="admin-modal__actions" style={{marginTop: '20px'}}>
          <button className="form__submit" onClick={onSubmit} disabled={status === 'loading'}>
            {status === 'loading' ? 'Subiendo videos...' : 'Registrar coreografía'}
          </button>
      </div>
    </div>
  );
}

export default RegisterChoreographyForm;
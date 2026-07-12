import { useState } from 'react';
import InputField from '../InputField/InputField';
import '../../styles/forms.css';
import './ForgotPasswordForm.css';

/**
 * ForgotPasswordForm
 *
 * Flujo actual del backend (UserService.recover_password_temporary):
 *  - El usuario ingresa su correo.
 *  - El backend valida que el correo exista, genera una contraseña
 *    TEMPORAL aleatoria y la envía por correo.
 *  - No hay un segundo paso de "definir nueva contraseña" en esta pantalla.
 *
 * Props:
 *  - onSubmit      {function}  Recibe { email }. La página (ForgotPasswordPage)
 *                              es quien hace el fetch y decide loading/success/error,
 *                              igual que LoginPage hace con LoginForm.
 *  - onBackToLogin {function}  Navegar de vuelta al login.
 *  - status        {string}    'idle' | 'loading' | 'success' (default 'idle')
 *  - serverError   {string}    Mensaje de error proveniente del backend
 */
function ForgotPasswordForm({ onSubmit, onBackToLogin, status = 'idle', serverError = null }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const emailIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validate = () => {
    if (!email.includes('@')) return 'Correo no válido';
    return '';
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit?.({ email });
  };

  if (status === 'success') {
    return (
      <div className="form">
        <h1 className="form__title">Revisa tu correo</h1>
        <p className="form__subtitle">
          Se ha generado una nueva contraseña temporal y ha sido enviada a tu correo electrónico con éxito.
        </p>
        <div className="forgot-password__success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="form__subtitle forgot-password__hint">
          Inicia sesión con la contraseña temporal y cámbiala desde tu perfil en cuanto puedas.
        </p>
        <button className="form__submit" onClick={onBackToLogin}>
          Volver a iniciar sesión <span>→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="form">
      <h1 className="form__title">¿Olvidaste tu contraseña?</h1>
      <p className="form__subtitle">
        Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas acceder de nuevo.
      </p>

      <InputField
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="Correo electrónico"
        icon={emailIcon}
        error={error}
      />

      {serverError && (
        <span className="input-field__error forgot-password__server-error">
          {serverError}
        </span>
      )}

      <button
        className="form__submit"
        onClick={handleSubmit}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar contraseña temporal'}
        {status !== 'loading' && <span>→</span>}
      </button>

      <p className="form__footer">
        ¿Recordaste tu contraseña?{' '}
        <button className="form__link-btn" onClick={onBackToLogin}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
}

export default ForgotPasswordForm;
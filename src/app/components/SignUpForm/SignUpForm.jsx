import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import InputField from '../InputField/InputField';
import PasswordInput from '../PasswordInput/PasswordInput';
import '../../styles/forms.css';
import './SignUpForm.css';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * AuthForm
 * Formulario de registro.
 * Props:
 *  - onSubmit  {function}  Recibe el objeto { nombres, apellidos, email, password }
 *  - onGoogleSubmit  {function}  Recibe el token de acceso de Google tras la autenticación 
 *  - onLogin   {function}  Navegar al login (link "Inicia sesión")
 */
function AuthForm({ onSubmit, onGoogleSubmit, onLogin }) {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverStatus, setServerStatus] = useState({ loading: false, error: null, success: null });

  const userIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const emailIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nombres.trim()) newErrors.nombres = 'El nombre es obligatorio';
    if (!form.apellidos.trim()) newErrors.apellidos = 'El apellido es obligatorio';
    if (!form.email.includes('@')) newErrors.email = 'Correo no válido';
    if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (!accepted) newErrors.terms = 'Debes aceptar los términos';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setServerStatus({ loading: true, error: null, success: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: form.nombres,
          last_name: form.apellidos,
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setServerStatus({ loading: false, error: null, success: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.' });
        // Limpiamos el formulario
        setForm({ nombres: '', apellidos: '', email: '', password: '' });
        setAccepted(false);
        // Si el componente padre necesita saber que se registró, lo llamamos
        onSubmit?.(form);
      } else {
        // Extraer mensajes de error de Django (ej. "El correo ya existe")
        const errorMessages = Object.values(data).flat().join(' | ');
        setServerStatus({ loading: false, error: errorMessages, success: null });
      }
    } catch (err) {
      setServerStatus({ loading: false, error: 'No se pudo conectar con el servidor de la academia.', success: null });
    }
  };

  // Implementación del flujo de Google OAuth
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onGoogleSubmit?.(tokenResponse.access_token);
    },
    onError: () => {
      setServerStatus({
        loading: false,
        error: 'Error al autenticarse con el servicio de Google.',
        success: null
      });
    },
  });

  /* Google icon */
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.4l-6.6 4.9C9.8 39.8 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  );

  return (
    <div className="form">
      <h1 className="form__title">¡Baila a tu ritmo hoy!</h1>
      <p className="form__subtitle">
        Crea tu cuenta para acceder a clases exclusivas y aprender con los mejores.
      </p>

      {serverStatus.error && (
        <div className="form__alert-error">
          {serverStatus.error}
        </div>
      )}
      {serverStatus.success && (
        <div className="form__alert-success">
          {serverStatus.success}
        </div>
      )}

      <div className="form__row">
        <InputField
          label="Nombres"
          value={form.nombres}
          onChange={handleChange('nombres')}
          placeholder="Luisa María"
          icon={userIcon}
          error={errors.nombres}
        />
        <InputField
          label="Apellidos"
          value={form.apellidos}
          onChange={handleChange('apellidos')}
          placeholder="Martínez"
          icon={userIcon}
          error={errors.apellidos}
        />
      </div>

      <InputField
        label="Correo electrónico"
        type="email"
        value={form.email}
        onChange={handleChange('email')}
        placeholder="luisa.martinez@gmail.com"
        icon={emailIcon}
        error={errors.email}
      />

      <PasswordInput
        label="Contraseña"
        value={form.password}
        onChange={handleChange('password')}
        error={errors.password}
      />

      <PasswordInput
        label="Confirmar contraseña"
        value={form.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
      />

      <div className={`form__terms ${errors.terms ? 'form__terms--error' : ''}`}>
        <input
          id="terms"
          type="checkbox"
          checked={accepted}
          onChange={(e) => {
            setAccepted(e.target.checked);
            if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
          }}
          className="form__checkbox"
        />
        <label htmlFor="terms" className="form__terms-label">
          Acepto los{' '}
          <a href="#" className="form__link">términos y condiciones</a>
          {' '}y la política de privacidad de la academia
        </label>
      </div>
      {errors.terms && <span className="form__terms-error">{errors.terms}</span>}

      <button
        className="form__submit"
        onClick={handleSubmit}
        disabled={serverStatus.loading}
        style={{ opacity: serverStatus.loading ? 0.7 : 1 }}
      >
        {serverStatus.loading ? 'Creando cuenta...' : <>Crear cuenta <span>→</span></>}
      </button>

      {/* Divider */}
      <div className="form__divider">
        <span />
        <p>o regístrate con</p>
        <span />
      </div>

      {/* Google */}
      <button 
        type="button"
        className="form__google" 
        onClick={() => {
          console.log("Clic en el botón de Google detectado"); // Línea de depuración temporal
          handleGoogleLogin();
        }}
      >
        <GoogleIcon /> Google
      </button>

      {/* Footer */}
      <p className="form__footer">
        ¿Ya tienes cuenta?{' '}
        <button className="form__link-btn" onClick={onLogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
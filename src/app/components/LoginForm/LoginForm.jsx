import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useGoogleLogin } from '@react-oauth/google';
import InputField from '../InputField/InputField';
import PasswordInput from '../PasswordInput/PasswordInput';
import '../../styles/forms.css';
import './LoginForm.css';

/**
 * LoginForm
 * Props:
 *  - onSubmit          {function}  Recibe { email, password }
 *  - onGoogleSubmit    {function}  Recibe el token de autenticación de Google
 *  - onSignUp          {function}  Navegar al registro
 *  - onForgotPassword  {function}  Navegar a recuperar contraseña
 */
function LoginForm( {onSubmit, onGoogleSubmit, onSignUp, onForgotPassword}) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [errors, setErrors] = useState({});

  // Clave del sitio obtenida de las variables de entorno de Vite
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

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
    if (!form.email.includes('@')) newErrors.email = 'Correo no válido';
    if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

    if (!captchaToken) {
      newErrors.captcha = 'Por favor, complete la verificación de seguridad.';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit?.({ 
      email: form.email, 
      password: form.password, 
      captcha_token: captchaToken 
    });
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onGoogleSubmit?.(tokenResponse.access_token);
    },
    onError: () => {
      alert('Error al autenticarse con el servicio de Google.');
    },
  });

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
      <h1 className="form__title">¡Bienvenido de nuevo!</h1>
      <p className="form__subtitle">
        Accede a tu cuenta para continuar aprendiendo.
      </p>

      <InputField
        label="Correo electrónico"
        type="email"
        value={form.email}
        onChange={handleChange('email')}
        placeholder="Correo electrónico"
        icon={emailIcon}
        error={errors.email}
      />

      <PasswordInput
        label="Contraseña"
        value={form.password}
        onChange={handleChange('password')}
        placeholder="Contraseña"
        error={errors.password}
        hint={
          <button className="form__forgot" onClick={onForgotPassword}>
            Olvidé mi contraseña
          </button>
        }
      />
      <div className="form__captcha-container" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
        <Turnstile
          siteKey={siteKey}
          onSuccess={(token) => {
            setCaptchaToken(token);
            if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
          }}
          onError={() => setCaptchaToken(null)}
          onExpire={() => setCaptchaToken(null)}
        />
      </div>
      {errors.captcha && <span className="input-field__error" style={{ display: 'block', textAlign: 'center', marginBottom: '15px' }}>{errors.captcha}</span>}
      
      <button className="form__submit" onClick={handleSubmit}>
        Iniciar Sesión <span>→</span>
      </button>

      <div className="form__divider">
        <span />
        <p>o inicia sesión con</p>
        <span />
      </div>

      {/* Botón de inicio de sesión con Google*/}
      <button type="button" className="form__google" onClick={() => handleGoogleLogin()}>
        <GoogleIcon /> Google
      </button>

      <p className="form__footer">
        ¿Aún no tienes cuenta?{' '}
        <button className="form__link-btn" onClick={onSignUp}>
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
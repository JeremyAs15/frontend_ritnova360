import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import LoginForm from '../../components/LoginForm/LoginForm';
import Loader from '../../components/Loader/Loader';
import urbanDance from '../../../assets/Login/urban-dance.webp';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * LoginPage
 * Props:
 *  - onLogin           {function}  Callback cuando el formulario es válido
 *  - onSignUp          {function}  Navegar a SignUpPage
 *  - onForgotPassword  {function}  Navegar a ForgotPasswordPage
 */
function LoginPage({ onLogin, onSignUp, onForgotPassword }) {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoginError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          captcha_token: credentials.captcha_token,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem("first_name", data.user.first_name);
        localStorage.setItem("role", data.user.role);
        window.dispatchEvent(new Event('auth-change'));

        navigate('/dashboard');
      } else {
        if (data.captcha) {
          setLoginError(data.captcha);
        } else if (data.detail) {
          setLoginError(data.detail);
        } else {
          setLoginError('No se pudo iniciar sesión. Verifique sus credenciales.');
        }
      }
    } catch (err) {
      setLoginError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleAccessToken) => {
    console.log("Token recibido:", googleAccessToken);
    setLoginError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: googleAccessToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem("first_name", data.user.first_name);
        localStorage.setItem("role", data.user.role);
        window.dispatchEvent(new Event('auth-change'));

        navigate('/dashboard');
      } else {
        setLoginError(data.detail || 'Fallo la autenticación con Google.');
      }
    } catch (err) {
      setLoginError('Error de comunicación con el servidor al intentar validar la cuenta de Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  const handleForgotPasswordRedirect = () => {
    navigate('/forgot-password');
  };

  return (
    <>
      {loading && <Loader fullscreen label="Iniciando sesión..." />}
      <AuthLayout
        tagline="Mueve tu alma."
        description="Siente el ritmo en cada paso y descubre el poder del movimiento en la academia de danza más vibrante del país."
        image={urbanDance}
      >
        {loginError && (
          <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #ef9a9a', textAlign: 'center' }}>
            {loginError}
          </div>
        )}
        <LoginForm
          onSubmit={handleLogin}
          onGoogleSubmit={handleGoogleLogin}
          onSignUp={handleSignUpRedirect}
          onForgotPassword={handleForgotPasswordRedirect}
          loading={loading}
        />
      </AuthLayout>
    </>
  );
}

export default LoginPage;

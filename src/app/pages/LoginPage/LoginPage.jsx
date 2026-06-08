import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import LoginForm from '../../components/LoginForm/LoginForm';

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

  const handleLogin = async (credentials) => {
    setLoginError(null);
    try {
      // Petición al endpoint personalizado de inicio de sesión de Django
      const response = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          captcha_token: credentials.captcha_token, // Se envía el token aquí
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Almacenar los tokens JWT obtenidos de forma segura
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Redirigir al dashboard u otra ruta protegida
        navigate('/'); 
      } else {
        // Manejo de errores específicos (ej. CAPTCHA incorrecto o credenciales inválidas)
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
    }
  };

  const handleGoogleLogin = async (googleAccessToken) => {
    setLoginError(null);
    try {
      // Nota: Si usaste useGoogleLogin del lado del cliente, puedes mandar el token de acceso
      // al backend. Adaptaremos el backend para validar el token que recibimos.
      const response = await fetch('http://localhost:8000/api/users/google-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: googleAccessToken, // Enviamos el token al endpoint del backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        navigate('/');
      } else {
        setLoginError(data.detail || 'Fallo la autenticación con Google.');
      }
    } catch (err) {
      setLoginError('Error de comunicación con el servidor al intentar validar la cuenta de Google.');
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  const handleForgotPasswordRedirect = () => {
    navigate('/forgot-password');
  };

  return (
    <AuthLayout
      tagline="Mueve tu alma."
      description="Siente el ritmo en cada paso y descubre el poder del movimiento en la academia de danza más vibrante del país."
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
      />
    </AuthLayout>
  );
}

export default LoginPage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import ForgotPasswordForm from '../../components/ForgotPasswordForm/ForgotPasswordForm';
import urbanDance from '../../../assets/Login/urban-dance.webp';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [serverError, setServerError] = useState(null);

  const handleForgotPassword = async ({ email }) => {
    setServerError(null);
    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setStatus('success');
      } else {
        setServerError(data.detail || 'No fue posible procesar la solicitud.');
        setStatus('idle');
      }
    } catch (err) {
      setServerError('Error de conexión con el servidor.');
      setStatus('idle');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <AuthLayout
      tagline="Mueve tu alma."
      description="Siente el ritmo en cada paso y descubre el poder del movimiento en la academia de danza más vibrante del país."
      image={urbanDance}
    >
      <ForgotPasswordForm
        onSubmit={handleForgotPassword}
        onBackToLogin={handleBackToLogin}
        status={status}
        serverError={serverError}
      />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
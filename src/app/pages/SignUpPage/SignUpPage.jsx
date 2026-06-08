import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import SignUpForm from '../../components/SignUpForm/SignUpForm';

function SignUpPage({ onSignUp, onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleGoogleSignUp = async (googleAccessToken) => {
    setError(null);
    try {
      // Petición al endpoint común del backend para autenticación con Google
      const response = await fetch('http://localhost:8000/api/users/google-login/', {
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
        // Almacenar las credenciales obtenidas de forma segura
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Redirigir a la página principal o dashboard del estudiante
        navigate('/');
      } else {
        setError(data.detail || 'No se pudo completar el registro con Google.');
      }
    } catch (err) {
      setError('Error de comunicación con el servidor al intentar validar la cuenta de Google.');
    }
  };

  return (
    <AuthLayout
      tagline="Libera tu energía, domina el escenario."
      description="Únete a la academia donde el movimiento se convierte en arte y la técnica se encuentra con la pasión."
    >
      {error && (
        <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #ef9a9a', textAlign: 'center' }}>
          {error}
        </div>
      )}
      <SignUpForm 
        onSubmit={onSignUp} 
        onGoogleSubmit={handleGoogleSignUp} 
        onLogin={onLogin} 
      />
    </AuthLayout>
  );
}

export default SignUpPage;
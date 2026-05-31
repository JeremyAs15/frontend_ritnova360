import AuthLayout from '../../components/AuthLayout/AuthLayout';
import SignUpForm from '../../components/SignUpForm/SignUpForm';

function SignUpPage({ onSignUp, onLogin }) {
  return (
    <AuthLayout
      tagline="Libera tu energía, domina el escenario."
      description="Únete a la academia donde el movimiento se convierte en arte y la técnica se encuentra con la pasión."
    >
      <SignUpForm onSubmit={onSignUp} onLogin={onLogin} />
    </AuthLayout>
  );
}

export default SignUpPage;
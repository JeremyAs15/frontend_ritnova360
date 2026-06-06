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
  return (
    <AuthLayout
      tagline="Mueve tu alma."
      description="Siente el ritmo en cada paso y descubre el poder del movimiento en la academia de danza más vibrante del país."
    >
      <LoginForm
        onSubmit={onLogin}
        onSignUp={onSignUp}
        onForgotPassword={onForgotPassword}
      />
    </AuthLayout>
  );
}

export default LoginPage;
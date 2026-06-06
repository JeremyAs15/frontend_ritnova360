import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage/LoginPage';
import SignUpPage from '../pages/SignUpPage/SignUpPage';
import { useNavigate } from 'react-router-dom';

function SignUpPageWrapper() {
  const navigate = useNavigate();
  return (
    <SignUpPage 
      onLogin={() => navigate('/')} 
      onSignUp={() => navigate('/')} 
    />
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
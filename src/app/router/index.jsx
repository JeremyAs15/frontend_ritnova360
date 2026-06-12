import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage/LoginPage';
import SignUpPage from '../pages/SignUpPage/SignUpPage';
import HomePage from '../pages/HomePage/HomePage';
import AdminPage from '../pages/AdminPage/AdminPage';
import { useNavigate } from 'react-router-dom';

function SignUpPageWrapper() {
  const navigate = useNavigate();
  return (
    <SignUpPage 
      onLogin={() => navigate('/login')} 
      onSignUp={() => navigate('/')} 
    />
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPageWrapper />} />
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

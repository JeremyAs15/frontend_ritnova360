import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage/LoginPage';
import SignUpPage from '../pages/SignUpPage/SignUpPage';
import HomePage from '../pages/HomePage/HomePage';
import AdminPage from '../pages/AdminPage/AdminPage';
import CoursePage from '../pages/CoursePage/CoursePage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import RegisterChoreographyPage from '../pages/RegisterChoreographyPage/RegisterChoreographyPage';
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
        <Route path="/admin/users" element={<AdminPage />} />
        <Route path="/curso/:id" element={<CoursePage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/coreografias/nueva" element={<RegisterChoreographyPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

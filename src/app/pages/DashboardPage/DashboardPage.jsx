import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import Loader from '../../components/Loader/Loader';
import { useProfile } from '../../context/ProfileContext';
import { getDashboardData, getStudentsCount } from '../../services/dashboardService';
import AdminDirectorDashboard from './AdminDirectorDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import './DashboardPage.css';

const ROLE_GREETING = {
  admin: 'este es el desempeño general de Ritnova 360.',
  director: 'este es el desempeño general de Ritnova 360.',
  teacher: 'sigue el rendimiento de tus coreografías.',
  student: 'continúa con tus clases o descubre nuevas coreografías.',
};

function DashboardPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, profileLoading, profileError } = useProfile();

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [range, setRange] = useState(null);
  const [studentsCount, setStudentsCount] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!profile?.role) return;

    const fetchDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const data = await getDashboardData(profile.role, range ?? {});
        setDashboardData(data);
      } catch (err) {
        setDashboardError(err.message || 'No se pudo cargar el dashboard.');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, [profile?.role, range]);

  useEffect(() => {
    if (profile?.role !== 'admin' && profile?.role !== 'director') return;

    getStudentsCount()
      .then(setStudentsCount)
      .catch(() => setStudentsCount(null));
  }, [profile?.role]);

  if (profileError) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <p className="dashboard-state-message dashboard-state-message--error">{profileError}</p>
        </main>
      </div>
    );
  }

  if (profileLoading || !profile) {
    return <Loader fullscreen label="Cargando tu panel..." />;
  }

  const { navItems, roleLabel } = getSidebarConfigForRole(profile.role);
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
  const firstName = profile.first_name || fullName;

  const renderRoleView = () => {
    if (dashboardError) {
      return <p className="dashboard-state-message dashboard-state-message--error">{dashboardError}</p>;
    }

    switch (profile.role) {
      case 'admin':
      case 'director':
        return (
          <AdminDirectorDashboard
            data={dashboardData}
            loading={dashboardLoading}
            range={range}
            onRangeChange={setRange}
            studentsCount={studentsCount}
          />
        );
      case 'teacher':
        return (
          <TeacherDashboard
            data={dashboardData}
            loading={dashboardLoading}
            range={range}
            onRangeChange={setRange}
          />
        );
      case 'student':
        return (
          <StudentDashboard
            data={dashboardData}
            loading={dashboardLoading}
            range={range}
            onRangeChange={setRange}
          />
        );
      default:
        return <p className="dashboard-state-message">Tu rol no tiene un dashboard configurado todavía.</p>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <p className="dashboard-hero__eyebrow">Ritnova 360</p>
          <h1 className="dashboard-hero__title">
            {profile.role === 'teacher' ? `Bienvenida, ${firstName}` : `¡Hola, ${firstName}!`}
          </h1>
          <p className="dashboard-hero__subtitle">{ROLE_GREETING[profile.role] || ''}</p>
        </div>

        {renderRoleView()}
      </main>
    </div>
  );
}

export default DashboardPage;

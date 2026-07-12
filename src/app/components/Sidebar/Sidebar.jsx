import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingCart, Package, User, LogOut, ChevronLeft, ChevronRight, Users, ClipboardList, Settings } from 'lucide-react';
import logoLargo from '/logoLargo.png';
import './Sidebar.css';

// Ítems por defecto para estudiantes
const STUDENT_NAV_ITEMS = [
  { title: 'Dashboard',     url: '/dashboard',   icon: LayoutDashboard },
  { title: 'Catálogo',      url: '/catalogo',    icon: BookOpen        },
  { title: 'Carrito',       url: '/carrito',     icon: ShoppingCart    },
  { title: 'Mis compras',   url: '/mis-compras', icon: Package         },
  { title: 'Mi perfil',     url: '/perfil',      icon: User            },
];

// Ítems para profesor
const TEACHER_NAV_ITEMS = [
  { title: 'Dashboard',     url: '/dashboard',   icon: LayoutDashboard },
  { title: 'Mi perfil',     url: '/perfil',      icon: User            },
];

// Ítems para admin / director
const ADMIN_NAV_ITEMS = [
  { title: 'Dashboard',              url: '/dashboard',              icon: LayoutDashboard },
  { title: 'Usuarios internos',      url: '/admin/users',            icon: Users           },
  { title: 'Catálogo coreografías',  url: '/admin/choreographies',   icon: ClipboardList   },
  { title: 'Panel servicios',        url: '/admin/settings',         icon: Settings        },
];

const ROLE_LABELS = {
  student: 'Estudiante',
  teacher: 'Profesor',
  admin: 'Administrador',
  director: 'Director',
};

const NAV_ITEMS_BY_ROLE = {
  student: STUDENT_NAV_ITEMS,
  teacher: TEACHER_NAV_ITEMS,
  admin: ADMIN_NAV_ITEMS,
  director: ADMIN_NAV_ITEMS,
};

/** Resuelve los ítems de navegación y la etiqueta visible según el código de rol del JWT. */
function getSidebarConfigForRole(role) {
  return {
    navItems: NAV_ITEMS_BY_ROLE[role] ?? STUDENT_NAV_ITEMS,
    roleLabel: ROLE_LABELS[role] ?? 'Usuario',
  };
}

export { STUDENT_NAV_ITEMS, TEACHER_NAV_ITEMS, ADMIN_NAV_ITEMS, getSidebarConfigForRole };

function Sidebar({ collapsed, onToggle, userName = 'Usuario', userRole = 'Estudiante', navItems }) {
  const navigate = useNavigate();

  const items = navItems || STUDENT_NAV_ITEMS;

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      {/* Logo */}
      <div className="sidebar__logo">
        {collapsed ? (
          <div className="sidebar__logo-icon">R</div>
        ) : (
          <img src={logoLargo} alt="Ritnova 360" className="sidebar__logo-img" />
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {!collapsed && (
          <p className="sidebar__nav-label">Navegación</p>
        )}
        <ul className="sidebar__nav-list">
          {items.map(({ title, url, icon: Icon }) => (
            <li key={url}>
              <NavLink
                to={url}
                end
                className={({ isActive }) =>
                  `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                }
              >
                <Icon className="sidebar__nav-icon" size={18} />
                {!collapsed && <span className="sidebar__nav-label-text">{title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle collapse */}
      <button className="sidebar__toggle" onClick={onToggle} aria-label="Colapsar menú">
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user-avatar">{initials}</div>
        {!collapsed && (
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{userName}</p>
            <p className="sidebar__user-role">{userRole}</p>
          </div>
        )}
        {!collapsed && (
          <button className="sidebar__logout" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut size={16} />
          </button>
        )}
      </div>

    </aside>
  );
}

export default Sidebar;
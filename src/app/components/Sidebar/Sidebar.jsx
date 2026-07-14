import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingCart, Library, User, LogOut, ChevronLeft, ChevronRight, Users, ClipboardList } from 'lucide-react';
import logoLargo from '/logoLargo.png';
import { useCart } from '../../context/CartContext';
import { logout } from '../../utils/auth';
import './Sidebar.css';

// Ítems por defecto para estudiantes
const STUDENT_NAV_ITEMS = [
  { title: 'Dashboard',     url: '/dashboard',   icon: LayoutDashboard },
  { title: 'Catálogo',      url: '/',            icon: BookOpen        },
  { title: 'Carrito',       url: '/carrito',     icon: ShoppingCart    },
  { title: 'Biblioteca',    url: '/mis-compras', icon: Library         },
  { title: 'Mi perfil',     url: '/perfil',      icon: User            },
];

// Ítems para admin / director
const ADMIN_NAV_ITEMS = [
  { title: 'Dashboard',              url: '/dashboard',              icon: LayoutDashboard },
  { title: 'Usuarios',      url: '/admin/users',            icon: Users           },
  { title: 'Catálogo coreografías',  url: '/coreografias/nueva',   icon: ClipboardList   },
];

// Ítems para profesor y director (ambos gestionan coreografías, ver academy/services.py → create_choreography)
const STAFF_NAV_ITEMS = [
  { title: 'Dashboard',        url: '/dashboard',          icon: LayoutDashboard },
  { title: 'Mis coreografías', url: '/coreografias/nueva', icon: ClipboardList   },
  { title: 'Mi perfil',        url: '/perfil',             icon: User            },
];

const DIRECTOR_NAV_ITEMS = [
  { title: 'Dashboard',             url: '/dashboard',          icon: LayoutDashboard },
  { title: 'Usuarios',     url: '/admin/users',        icon: Users           },
  { title: 'Gestión Coreografías',  url: '/coreografias/nueva', icon: ClipboardList   }, 
  { title: 'Mi perfil',             url: '/perfil',             icon: User            },
];

const ROLE_LABELS = {
  student: 'Estudiante',
  teacher: 'Profesor',
  admin: 'Administrador',
  director: 'Director',
};

const NAV_ITEMS_BY_ROLE = {
  student: STUDENT_NAV_ITEMS,
  teacher: STAFF_NAV_ITEMS,
  admin: ADMIN_NAV_ITEMS,
  director: DIRECTOR_NAV_ITEMS,
};

/** Resuelve los ítems de navegación y la etiqueta visible según el código de rol del JWT. */
function getSidebarConfigForRole(role) {
  return {
    navItems: NAV_ITEMS_BY_ROLE[role] ?? STUDENT_NAV_ITEMS,
    roleLabel: ROLE_LABELS[role] ?? 'Usuario',
  };
}

export { STUDENT_NAV_ITEMS, ADMIN_NAV_ITEMS, STAFF_NAV_ITEMS, getSidebarConfigForRole };

function Sidebar({ collapsed, onToggle, userName = 'Usuario', userRole = 'Estudiante', navItems }) {
  const { cartItems } = useCart();
  const cartCount = cartItems?.length || 0;

  const items = navItems || STUDENT_NAV_ITEMS;

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
                state={{ scrollToCatalog: title === 'Catálogo' }}
                end
                className={({ isActive }) =>
                  `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                }
              >
                <div className="sidebar__nav-icon-wrapper">
                  <Icon className="sidebar__nav-icon" size={18} />
                  {url === '/carrito' && cartCount > 0 && collapsed && (
                    <span className="sidebar__cart-badge sidebar__cart-badge--collapsed">
                      {cartCount}
                    </span>
                  )}
                </div>
                {!collapsed && <span className="sidebar__nav-label-text">{title}</span>}
                {url === '/carrito' && cartCount > 0 && !collapsed && (
                  <span className="sidebar__cart-badge">
                    {cartCount}
                  </span>
                )}
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
          <button className="sidebar__logout" onClick={logout} aria-label="Cerrar sesión">
            <LogOut size={16} />
          </button>
        )}
      </div>

    </aside>
  );
}

export default Sidebar;
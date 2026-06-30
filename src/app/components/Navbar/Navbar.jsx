import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar
 * Props:
 *  - onCatalogClick  {function}  Scroll al catálogo
 */
function Navbar({ onCatalogClick }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [firstName, setFirstName] = useState(localStorage.getItem('first_name'));

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
      setFirstName(localStorage.getItem('first_name'));
    };

    window.addEventListener('storage', syncAuth);      // cambios desde otra pestaña
    window.addEventListener('auth-change', syncAuth);   // cambios en la misma pestaña

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCatalogClick = () => {
    setMenuOpen(false);
    onCatalogClick?.();
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Logo */}
      <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
        <img src="/logoLargo.png" alt="Ritnova 360" />
      </Link>

      {/* Links */}
      <div className="navbar__links">
        <button className="navbar__link" onClick={onCatalogClick}>
          Catálogo
        </button>
        <button className="navbar__link" onClick={() => navigate('/sobre-nosotros')}>
          Sobre Nosotros
        </button>
      </div>

      {/* Acciones */}
      {!isLoggedIn ? (
        <div className="navbar__actions">
          <button className="navbar__btn navbar__btn--ghost" onClick={() => navigate('/login')}>
            Iniciar sesión
        </button>
        <button className="navbar__btn navbar__btn--primary" onClick={() => navigate('/signup')}>
            Crear cuenta
          </button>
        </div>
      ) : (
        <div className="navbar__actions">
          <span className="navbar__welcome">
            Hola, {firstName}
          </span>
        </div>
      )}

      {/* Botón hamburguesa*/}
      <button
        className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Menú móvil */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <button className="navbar__mobile-link" onClick={handleCatalogClick}>
          Catálogo
        </button>
        <button className="navbar__mobile-link" onClick={() => goTo('/sobre-nosotros')}>
          Sobre Nosotros
        </button>
        {!isLoggedIn ? (
          <>
            <button className="navbar__mobile-btn navbar__mobile-btn--ghost" onClick={() => goTo('/login')}>
              Iniciar sesión
            </button>
            <button className="navbar__mobile-btn navbar__mobile-btn--primary" onClick={() => goTo('/signup')}>
              Crear cuenta
            </button>
          </>
        ) : (
          <span className="navbar__mobile-user">
            Hola, {firstName}
          </span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar
 * Props:
 *  - onCatalogClick  {function}  Scroll al catálogo
 */
function Navbar({ onCatalogClick }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Logo */}
      <div className="navbar__logo" onClick={() => navigate('/')}>
        <img src="public/logoLargo.png" alt="Ritnova 360" />
      </div>

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
      <div className="navbar__actions">
        <button className="navbar__btn navbar__btn--ghost" onClick={() => navigate('/login')}>
            Iniciar sesión
        </button>
        <button className="navbar__btn navbar__btn--primary" onClick={() => navigate('/signup')}>
            Crear cuenta
          </button>
        </div>
      </nav>
  );
}

export default Navbar;
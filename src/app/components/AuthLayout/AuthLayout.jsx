import { Link } from 'react-router-dom';
import './AuthLayout.css';

function AuthLayout({ tagline, description, image, children }) {
  return (
    <div className="auth-layout">
 
      {/* Panel izquierdo */}
      <div
        className="auth-layout__panel"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="auth-layout__overlay" />
        <div className="auth-layout__tagline">
          <h2>{tagline}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
 
      {/* Panel derecho */}
      <div className="auth-layout__form-area">
        <Link to="/" className="auth-layout__logo">
          <img src="/logoLargo.png" alt="Ritnova 360" />
        </Link>
 
        {children}
      </div>
 
    </div>
  );
}
 
export default AuthLayout;
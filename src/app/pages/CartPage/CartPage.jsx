import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Tag, ArrowLeft, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart, cartTotal, formatCOP } = useCart();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Estados de cupón de descuento
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Estado del modal de éxito de pago
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API_BASE_URL}/api/users/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar tu perfil.');
        return res.json();
      })
      .then(setProfile)
      .catch((err) => setProfileError(err.message));
  }, [navigate]);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Por favor ingresa un código.');
      return;
    }

    if (code === 'RITNOVA10') {
      setDiscountPercent(0.10);
      setCouponSuccess('¡Cupón RITNOVA10 aplicado! 10% de descuento.');
    } else if (code === 'RITNOVA20') {
      setDiscountPercent(0.20);
      setCouponSuccess('¡Cupón RITNOVA20 aplicado! 20% de descuento.');
    } else if (code === 'BAILE50') {
      setDiscountPercent(0.50);
      setCouponSuccess('¡Cupón BAILE50 aplicado! 50% de descuento especial.');
    } else {
      setCouponError('El cupón ingresado no es válido.');
      setDiscountPercent(0);
    }
  };

  const handleCheckout = () => {
    // Abrir modal de simulación de pago exitoso
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = (redirectTo) => {
    setShowSuccessModal(false);
    clearCart();
    if (redirectTo === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  if (profileError) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <p className="cart-state-message cart-state-message--error">{profileError}</p>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <p className="cart-state-message">Cargando tu carrito...</p>
        </main>
      </div>
    );
  }

  const { navItems, roleLabel } = getSidebarConfigForRole(profile.role);
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;

  // Cálculos de precios
  const discountAmount = cartTotal * discountPercent;
  const finalTotal = cartTotal - discountAmount;

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        userName={fullName}
        userRole={roleLabel}
        navItems={navItems}
      />

      <main className="dashboard-main">
        <div className="cart-page-content">
          {/* Breadcrumb */}
          <div className="cart-breadcrumb">
            <button className="cart-back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Volver al catálogo
            </button>
            <span className="cart-breadcrumb-sep">/</span>
            <span className="cart-breadcrumb-current">Carrito</span>
          </div>

          <h1 className="cart-page-title">Mi Carrito de Compras</h1>

          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon-wrap">
                <ShoppingCart className="cart-empty-icon" size={48} />
              </div>
              <h2 className="cart-empty-title">Tu carrito está vacío</h2>
              <p className="cart-empty-text">
                Parece que aún no has agregado ninguna clase o coreografía a tu carrito. ¡Explora nuestro catálogo y empieza a aprender con los mejores profesores hoy mismo!
              </p>
              <button className="cart-explore-btn" onClick={() => navigate('/')}>
                Explorar catálogo de cursos
              </button>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Lista de Cursos */}
              <div className="cart-items-column">
                <p className="cart-items-count">Tienes {cartItems.length} curso{cartItems.length > 1 ? 's' : ''} en tu carrito</p>
                <div className="cart-items-list">
                  {cartItems.map((course) => (
                    <div key={course.id} className="cart-item-card">
                      <div className="cart-item-image-container" onClick={() => navigate(`/curso/${course.id}`)}>
                        <img src={course.image} alt={course.title} className="cart-item-image" />
                        <span className="cart-item-genre">{course.genre}</span>
                      </div>

                      <div className="cart-item-details">
                        <h3 className="cart-item-title" onClick={() => navigate(`/curso/${course.id}`)}>{course.title}</h3>
                        <p className="cart-item-instructor">Por {course.instructor}</p>
                        <div className="cart-item-meta">
                          <span className="cart-item-meta-tag">{course.level}</span>
                          <span className="cart-item-meta-dot">•</span>
                          <span className="cart-item-duration">{course.duration}</span>
                        </div>
                      </div>

                      <div className="cart-item-price-actions">
                        <span className="cart-item-price">${course.price} COP</span>
                        <button 
                          className="cart-item-remove-btn" 
                          onClick={() => removeFromCart(course.id)}
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="cart-summary-column">
                <div className="cart-summary-card">
                  <h2 className="cart-summary-title">Resumen de tu compra</h2>
                  
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Subtotal ({cartItems.length} curso{cartItems.length > 1 ? 's' : ''})</span>
                    <span className="cart-summary-val">{formatCOP(cartTotal)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="cart-summary-row cart-summary-row--discount">
                      <span className="cart-summary-label">Descuento ({discountPercent * 100}%)</span>
                      <span className="cart-summary-val">-{formatCOP(discountAmount)}</span>
                    </div>
                  )}

                  {/* Campo de Cupón */}
                  <div className="cart-coupon-section">
                    <p className="cart-coupon-title">
                      <Tag size={14} /> ¿Tienes un cupón de descuento?
                    </p>
                    <div className="cart-coupon-input-wrap">
                      <input
                        type="text"
                        placeholder="Ej: RITNOVA10, BAILE50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="cart-coupon-input"
                      />
                      <button className="cart-coupon-apply-btn" onClick={handleApplyCoupon}>
                        Aplicar
                      </button>
                    </div>
                    {couponError && <p className="cart-coupon-msg cart-coupon-msg--error">{couponError}</p>}
                    {couponSuccess && <p className="cart-coupon-msg cart-coupon-msg--success">{couponSuccess}</p>}
                  </div>

                  <hr className="cart-summary-divider" />

                  <div className="cart-summary-row cart-summary-row--total">
                    <span className="cart-summary-total-label">Total a pagar</span>
                    <span className="cart-summary-total-val">{formatCOP(finalTotal)}</span>
                  </div>

                  <button className="cart-checkout-btn" onClick={handleCheckout}>
                    Proceder al pago
                  </button>

                  <button className="cart-clear-btn" onClick={clearCart}>
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Pago Exitoso */}
      {showSuccessModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-card">
            <div className="checkout-success-icon-wrap">
              <CheckCircle className="checkout-success-icon" size={48} />
            </div>
            
            <h2 className="checkout-success-title">¡Compra procesada con éxito!</h2>
            
            <div className="checkout-success-badge">
              <Sparkles size={14} /> Inscripción Confirmada
            </div>

            <p className="checkout-success-text">
              Tu inscripción a las coreografías ha sido completada de forma segura. Hemos enviado los detalles de tu compra a tu correo electrónico.
            </p>

            <div className="checkout-success-summary">
              <p className="checkout-summary-heading">Resumen de inscripción:</p>
              <ul className="checkout-items-list">
                {cartItems.map(item => (
                  <li key={item.id} className="checkout-item-name">
                    ✓ {item.title}
                  </li>
                ))}
              </ul>
              <div className="checkout-summary-total">
                <span>Total pagado:</span>
                <strong>{formatCOP(finalTotal)}</strong>
              </div>
            </div>

            <div className="checkout-modal-actions">
              <button 
                className="checkout-action-btn checkout-action-btn--primary"
                onClick={() => handleCloseSuccessModal('dashboard')}
              >
                Ir a mi panel (Dashboard)
              </button>
              <button 
                className="checkout-action-btn checkout-action-btn--secondary"
                onClick={() => handleCloseSuccessModal('catalog')}
              >
                Ver más coreografías
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;

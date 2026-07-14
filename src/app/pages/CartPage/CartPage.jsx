import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle, Sparkles, AlertCircle, Trash2, CreditCard, Landmark, X, User } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, formatCOP, cartError, cartLoading, cartCheckoutLoading, refreshCart, checkout, clearCart, removeFromCart } = useCart();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkoutCompletedItems, setCheckoutCompletedItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentForm, setPaymentForm] = useState({
    first_name: '',
    last_name: '',
    doc_type: 'CC',
    doc_number: '',
    phone: '',
    email: '',
    address: '',
    card_number: '',
    cvv: '',
    expiry: '',
    bank: '',
  });
  const [paymentError, setPaymentError] = useState(null);

  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;

    const res = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  }, []);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    let res = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });

    if (res.status === 401) {
      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return null;
      }

      res = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, Authorization: `Bearer ${newAccessToken}` },
      });
    }

    return res;
  }, [navigate, refreshAccessToken]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchWithAuth(`${API_BASE_URL}/api/users/profile/`)
      .then((res) => {
        if (!res) return null;
        if (!res.ok) throw new Error('No se pudo cargar tu perfil.');
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch((err) => setProfileError(err.message));

    refreshCart();
  }, [navigate, refreshCart, fetchWithAuth]);

  const handleOpenPaymentModal = () => {
    setPaymentError(null);
    setPaymentForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      doc_type: 'CC',
      doc_number: '',
      phone: '',
      email: profile?.email || '',
      address: '',
      card_number: '',
      cvv: '',
      expiry: '',
      bank: '',
    });
    setPaymentMethod('card');
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentError(null);
  };

  const handlePaymentFormChange = (field, value) => {
    if (field === 'card_number') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      setPaymentForm(prev => ({ ...prev, card_number: formatted }));
    } else if (field === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      if (digits.length > 2) {
        setPaymentForm(prev => ({ ...prev, expiry: digits.slice(0, 2) + '/' + digits.slice(2) }));
      } else {
        setPaymentForm(prev => ({ ...prev, expiry: digits }));
      }
    } else if (field === 'cvv') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      setPaymentForm(prev => ({ ...prev, cvv: digits }));
    } else {
      setPaymentForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleConfirmPayment = async () => {
    setPaymentError(null);

    if (!paymentForm.first_name.trim() || !paymentForm.last_name.trim()) {
      setPaymentError('Debe ingresar sus nombres y apellidos');
      return;
    }
    if (!paymentForm.doc_number.trim() || paymentForm.doc_number.length < 5) {
      setPaymentError('Número de documento inválido (mín. 5 caracteres)');
      return;
    }
    if (!paymentForm.phone.trim()) {
      setPaymentError('Debe ingresar un número de teléfono');
      return;
    }
    if (!paymentForm.email.trim() || !paymentForm.email.includes('@')) {
      setPaymentError('Correo electrónico inválido');
      return;
    }
    if (!paymentForm.address.trim()) {
      setPaymentError('Debe ingresar su dirección');
      return;
    }

    const billingInfo = {
      first_name: paymentForm.first_name.trim(),
      last_name: paymentForm.last_name.trim(),
      doc_type: paymentForm.doc_type,
      doc_number: paymentForm.doc_number.trim(),
      phone: paymentForm.phone.trim(),
      email: paymentForm.email.trim(),
      address: paymentForm.address.trim(),
    };

    let paymentData;
    if (paymentMethod === 'card') {
      const cardNumber = paymentForm.card_number.replace(/\s/g, '');
      if (!cardNumber || cardNumber.length < 13) {
        setPaymentError('Número de tarjeta inválido (mín. 13 dígitos)');
        return;
      }
      if (!paymentForm.cvv.trim() || paymentForm.cvv.length < 3) {
        setPaymentError('Código de seguridad CVV inválido');
        return;
      }
      if (!paymentForm.expiry.trim() || !paymentForm.expiry.includes('/')) {
        setPaymentError('Fecha de expiración inválida (use MM/AA)');
        return;
      }
      paymentData = {
        card_number: paymentForm.card_number,
        cvv: paymentForm.cvv,
        expiry: paymentForm.expiry,
      };
    } else {
      if (!paymentForm.bank.trim()) {
        setPaymentError('Debe seleccionar una entidad bancaria');
        return;
      }
      paymentData = {
        bank: paymentForm.bank,
        email: paymentForm.email,
        doc_number: paymentForm.doc_number,
      };
    }

    const completedCart = await checkout({ billingInfo, paymentMethod, paymentData });
    if (completedCart) {
      setShowPaymentModal(false);
      setCheckoutCompletedItems([...cartItems]);
      setCheckoutTotal(cartTotal);
      setShowSuccessModal(true);
    }
  };

  const handleCloseSuccessModal = (redirectTo) => {
    setShowSuccessModal(false);
    setCheckoutCompletedItems([]);
    setCheckoutTotal(0);
    if (redirectTo === 'dashboard') {
      navigate('/mis-compras');
    } else {
      navigate('/');
    }
  };

  const fallbackSidebar = getSidebarConfigForRole('student');
  const { navItems, roleLabel } = profile ? getSidebarConfigForRole(profile.role) : fallbackSidebar;
  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
    : 'Usuario';

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
          {profileError && (
            <div className="cart-error-banner">
              <AlertCircle size={18} />
              <span>No se pudo cargar tu perfil. El carrito sigue disponible.</span>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="cart-breadcrumb">
            <button className="cart-back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Volver al catálogo
            </button>
            <span className="cart-breadcrumb-sep">/</span>
            <span className="cart-breadcrumb-current">Carrito</span>
          </div>

          <h1 className="cart-page-title">Mi Carrito de Compras</h1>

          {cartError && (
            <div className="cart-error-banner">
              <AlertCircle size={18} />
              <span>{cartError}</span>
            </div>
          )}

          {cartLoading ? (
            <div className="cart-empty-state">
              <p className="cart-state-message">Cargando tu carrito...</p>
            </div>
          ) : cartItems.length === 0 ? (
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
                        <button className="cart-item-remove-btn" onClick={() => removeFromCart(course.id)} title="Eliminar del carrito">
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

                  <hr className="cart-summary-divider" />

                  <div className="cart-summary-row cart-summary-row--total">
                    <span className="cart-summary-total-label">Total a pagar</span>
                    <span className="cart-summary-total-val">{formatCOP(cartTotal)}</span>
                  </div>

                  <button className="cart-checkout-btn" onClick={handleOpenPaymentModal} disabled={cartCheckoutLoading}>
                    {cartCheckoutLoading ? 'Procesando...' : 'Proceder al pago'}
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

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-card payment-modal-card">
            <button className="payment-modal-close" onClick={handleClosePaymentModal}>
              <X size={20} />
            </button>

            <h2 className="checkout-success-title">Checkout</h2>

            {paymentError && (
              <div className="cart-error-banner" style={{ marginTop: 8, marginBottom: 16 }}>
                <AlertCircle size={18} />
                <span>{paymentError}</span>
              </div>
            )}

            {/* --- Datos del comprador --- */}
            <div className="payment-section">
              <div className="payment-section-header">
                <User size={16} />
                <span>Datos del comprador</span>
              </div>
              <div className="payment-form">
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label className="payment-form-label">Nombres <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="text"
                      placeholder="Nombres"
                      value={paymentForm.first_name}
                      onChange={(e) => handlePaymentFormChange('first_name', e.target.value)}
                    />
                  </div>
                  <div className="payment-form-group">
                    <label className="payment-form-label">Apellidos <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="text"
                      placeholder="Apellidos"
                      value={paymentForm.last_name}
                      onChange={(e) => handlePaymentFormChange('last_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label className="payment-form-label">Tipo doc.</label>
                    <select
                      className="payment-form-input payment-form-select"
                      value={paymentForm.doc_type}
                      onChange={(e) => handlePaymentFormChange('doc_type', e.target.value)}
                    >
                      <option value="CC">Cédula Ciudadanía</option>
                      <option value="CE">Cédula Extranjería</option>
                      <option value="NIT">NIT</option>
                      <option value="TI">Tarjeta Identidad</option>
                    </select>
                  </div>
                  <div className="payment-form-group">
                    <label className="payment-form-label">N° Documento <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="text"
                      placeholder="1234567890"
                      value={paymentForm.doc_number}
                      onChange={(e) => handlePaymentFormChange('doc_number', e.target.value)}
                    />
                  </div>
                </div>
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label className="payment-form-label">Teléfono <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="tel"
                      placeholder="300 123 4567"
                      value={paymentForm.phone}
                      onChange={(e) => handlePaymentFormChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="payment-form-group">
                    <label className="payment-form-label">Correo <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={paymentForm.email}
                      onChange={(e) => handlePaymentFormChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="payment-form-group">
                  <label className="payment-form-label">Dirección <span className="payment-form-required">*</span></label>
                  <input
                    className="payment-form-input"
                    type="text"
                    placeholder="Cra 1 # 2-3, Ciudad"
                    value={paymentForm.address}
                    onChange={(e) => handlePaymentFormChange('address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* --- Método de pago --- */}
            <div className="payment-section">
              <div className="payment-section-header">
                <CreditCard size={16} />
                <span>Método de pago</span>
              </div>

              <div className="payment-method-tabs">
                <button
                  className={`payment-method-tab ${paymentMethod === 'card' ? 'payment-method-tab--active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={18} /> Tarjeta
                </button>
                <button
                  className={`payment-method-tab ${paymentMethod === 'pse' ? 'payment-method-tab--active' : ''}`}
                  onClick={() => setPaymentMethod('pse')}
                >
                  <Landmark size={18} /> PSE
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="payment-form">
                  <div className="payment-form-group">
                    <label className="payment-form-label">Número de tarjeta <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.card_number}
                      onChange={(e) => handlePaymentFormChange('card_number', e.target.value)}
                    />
                  </div>
                  <div className="payment-form-row">
                    <div className="payment-form-group">
                      <label className="payment-form-label">CVV <span className="payment-form-required">*</span></label>
                      <input
                        className="payment-form-input"
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        value={paymentForm.cvv}
                        onChange={(e) => handlePaymentFormChange('cvv', e.target.value)}
                      />
                    </div>
                    <div className="payment-form-group">
                      <label className="payment-form-label">Vencimiento <span className="payment-form-required">*</span></label>
                      <input
                        className="payment-form-input"
                        type="text"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={paymentForm.expiry}
                        onChange={(e) => handlePaymentFormChange('expiry', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="payment-form">
                  <div className="payment-form-group">
                    <label className="payment-form-label">Banco <span className="payment-form-required">*</span></label>
                    <select
                      className="payment-form-input payment-form-select"
                      value={paymentForm.bank}
                      onChange={(e) => handlePaymentFormChange('bank', e.target.value)}
                    >
                      <option value="">Seleccione un banco</option>
                      <option value="bancolombia">Bancolombia</option>
                      <option value="davivienda">Davivienda</option>
                      <option value="nequi">Nequi</option>
                      <option value="bogota">Banco de Bogotá</option>
                      <option value="occidente">Banco de Occidente</option>
                      <option value="popular">Banco Popular</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="payment-summary-row">
              <span>Total a pagar</span>
              <strong>{formatCOP(cartTotal)}</strong>
            </div>

            <div className="checkout-modal-actions">
              <button
                className="checkout-action-btn checkout-action-btn--primary"
                onClick={handleConfirmPayment}
                disabled={cartCheckoutLoading}
              >
                {cartCheckoutLoading ? 'Procesando pago...' : 'Confirmar pago'}
              </button>
              <button
                className="checkout-action-btn checkout-action-btn--secondary"
                onClick={handleClosePaymentModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
                {checkoutCompletedItems.map(item => (
                  <li key={item.id} className="checkout-item-name">
                    ✓ {item.title}
                  </li>
                ))}
              </ul>
              <div className="checkout-summary-total">
                <span>Total pagado:</span>
                <strong>{formatCOP(checkoutTotal)}</strong>
              </div>
            </div>

            <div className="checkout-modal-actions">
              <button 
                className="checkout-action-btn checkout-action-btn--primary"
                onClick={() => handleCloseSuccessModal('dashboard')}
              >
                Ir a mi biblioteca
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

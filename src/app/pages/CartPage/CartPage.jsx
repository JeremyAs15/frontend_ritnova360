import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle, Sparkles, AlertCircle, Trash2, CreditCard, Landmark, X, User } from 'lucide-react';
import Sidebar, { getSidebarConfigForRole } from '../../components/Sidebar/Sidebar';
import { useCart } from '../../context/CartContext';
import { useProfile } from '../../context/ProfileContext';
import Loader from '../../components/Loader/Loader';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './CartPage.css';

// Solo se guarda temporalmente la información de facturación (no la de pago:
// número de tarjeta, CVV, vencimiento nunca se persisten, ni siquiera aquí).
const BILLING_DRAFT_KEY = 'ritnova_checkout_billing_draft';
const BILLING_FIELDS = ['first_name', 'last_name', 'doc_type', 'doc_number', 'phone', 'email', 'address', 'country', 'department', 'city'];

function loadBillingDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(BILLING_DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
}

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, formatCOP, cartError, cartLoading, cartCheckoutLoading, refreshCart, checkout, clearCart, removeFromCart } = useCart();
  const { profile, profileLoading, profileError } = useProfile();

  const [collapsed, setCollapsed] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkoutCompletedItems, setCheckoutCompletedItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removingItem, setRemovingItem] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
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
    country: '',
    department: '',
    city: '',
    card_number: '',
    cvv: '',
    expiry: '',
    bank: '',
  });
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
      return;
    }

    refreshCart();
  }, [navigate, refreshCart]);

  const handleOpenPaymentModal = () => {
    setPaymentError(null);
    const draft = loadBillingDraft();
    setPaymentForm({
      first_name: draft.first_name || profile?.first_name || '',
      last_name: draft.last_name || profile?.last_name || '',
      doc_type: draft.doc_type || profile?.document_type || 'CC',
      doc_number: draft.doc_number || profile?.n_documento || '',
      phone: draft.phone || profile?.phone_number || '',
      email: draft.email || profile?.email || '',
      address: draft.address || '',
      country: draft.country || profile?.country || '',
      department: draft.department || profile?.department || '',
      city: draft.city || profile?.city || '',
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

  const handleConfirmRemoveItem = async () => {
    if (!itemToRemove) return;
    setRemovingItem(true);
    try {
      await removeFromCart(itemToRemove.id);
      setItemToRemove(null);
    } finally {
      setRemovingItem(false);
    }
  };

  const handleConfirmClearCart = async () => {
    setClearingCart(true);
    try {
      await clearCart();
      setShowClearConfirm(false);
    } finally {
      setClearingCart(false);
    }
  };

  // Guarda un borrador de los datos de facturación mientras el modal de pago
  // está abierto, para no perderlos si la página se recarga por accidente.
  useEffect(() => {
    if (!showPaymentModal) return;
    const draft = {};
    BILLING_FIELDS.forEach((field) => { draft[field] = paymentForm[field]; });
    sessionStorage.setItem(BILLING_DRAFT_KEY, JSON.stringify(draft));
  }, [paymentForm, showPaymentModal]);

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
    if (!paymentForm.country.trim()) {
      setPaymentError('Debe ingresar su país');
      return;
    }
    if (!paymentForm.department.trim()) {
      setPaymentError('Debe ingresar su departamento');
      return;
    }
    if (!paymentForm.city.trim()) {
      setPaymentError('Debe ingresar su ciudad');
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
      country: paymentForm.country.trim(),
      department: paymentForm.department.trim(),
      city: paymentForm.city.trim(),
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
      sessionStorage.removeItem(BILLING_DRAFT_KEY);
      setShowPaymentModal(false);
      setCheckoutCompletedItems([...cartItems]);
      setCheckoutTotal(cartTotal);
      setCheckoutOrder({
        id: completedCart.shopping_cart_id,
        date: completedCart.date,
      });
      setShowSuccessModal(true);
    }
  };

  const handleCloseSuccessModal = (redirectTo) => {
    setShowSuccessModal(false);
    setCheckoutCompletedItems([]);
    setCheckoutTotal(0);
    setCheckoutOrder(null);
    if (redirectTo === 'dashboard') {
      navigate('/mis-compras');
    } else {
      navigate('/');
    }
  };

  if (profileLoading && !profile && !profileError) {
    return <Loader fullscreen label="Cargando..." />;
  }

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
            <Loader label="Cargando tu carrito..." />
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
                        <button className="cart-item-remove-btn" onClick={() => setItemToRemove(course)} title="Eliminar del carrito">
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

                  <button className="cart-clear-btn" onClick={() => setShowClearConfirm(true)}>
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmar eliminación de un ítem */}
      <ConfirmModal
        open={!!itemToRemove}
        title="¿Eliminar del carrito?"
        message={<>¿Estás seguro de que deseas eliminar <strong>{itemToRemove?.title}</strong> de tu carrito?</>}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmRemoveItem}
        onCancel={() => setItemToRemove(null)}
        loading={removingItem}
      />

      {/* Confirmar vaciado del carrito */}
      <ConfirmModal
        open={showClearConfirm}
        title="¿Vaciar el carrito?"
        message="Se eliminarán todos los cursos que agregaste. Esta acción no se puede deshacer."
        confirmLabel="Vaciar carrito"
        onConfirm={handleConfirmClearCart}
        onCancel={() => setShowClearConfirm(false)}
        loading={clearingCart}
      />

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
                      <option value="PASSPORT">Pasaporte</option>
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
                    placeholder="Cra 1 # 2-3"
                    value={paymentForm.address}
                    onChange={(e) => handlePaymentFormChange('address', e.target.value)}
                  />
                </div>
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label className="payment-form-label">País <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="text"
                      placeholder="Colombia"
                      value={paymentForm.country}
                      onChange={(e) => handlePaymentFormChange('country', e.target.value)}
                    />
                  </div>
                  <div className="payment-form-group">
                    <label className="payment-form-label">Departamento <span className="payment-form-required">*</span></label>
                    <input
                      className="payment-form-input"
                      type="text"
                      placeholder="Valle del Cauca"
                      value={paymentForm.department}
                      onChange={(e) => handlePaymentFormChange('department', e.target.value)}
                    />
                  </div>
                </div>
                <div className="payment-form-group">
                  <label className="payment-form-label">Ciudad <span className="payment-form-required">*</span></label>
                  <input
                    className="payment-form-input"
                    type="text"
                    placeholder="Cali"
                    value={paymentForm.city}
                    onChange={(e) => handlePaymentFormChange('city', e.target.value)}
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
              <p className="checkout-summary-heading">
                Comprobante de compra {checkoutOrder?.id ? `N.º ${checkoutOrder.id}` : ''}
                {checkoutOrder?.date ? ` · ${checkoutOrder.date}` : ''}
              </p>
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

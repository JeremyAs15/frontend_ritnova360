import { createContext, useContext, useState, useCallback } from 'react';
import { COURSES } from '../data/courses';

const CartContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdding, setCartAdding] = useState(false);
  const [cartCheckoutLoading, setCartCheckoutLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    let res = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });

    if (res.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return null;
      }
      const refreshRes = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('access_token', data.access);
        res = await fetch(url, {
          ...options,
          headers: { ...defaultHeaders, Authorization: `Bearer ${data.access}` },
        });
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return null;
      }
    }

    return res;
  }, []);

  const enrichItems = useCallback((backendItems) => {
    const normalizePrice = (value) => {
      if (value === null || value === undefined || value === '') return '0';
      if (typeof value === 'number') {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }

      const numeric = Number(String(value).replace(/[^\d.]/g, ''));
      if (!Number.isNaN(numeric) && numeric > 0) {
        return Math.round(numeric).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }

      return String(value);
    };

    return backendItems.map((item) => {
      const course = COURSES.find((c) => c.id === item.choreography);
      const fallbackBackendPrice = normalizePrice(item.choreography_price);

      return {
        ...item,
        id: item.choreography,
        title: item.choreography_name || course?.title || '',
        // Keep price aligned with Home/Course catalog when the course exists locally.
        price: course?.price || fallbackBackendPrice,
        image: course?.image || '',
        genre: course?.genre || '',
        instructor: course?.instructor || '',
        level: course?.level || '',
        duration: course?.duration || '',
      };
    });
  }, []);

  const refreshCart = useCallback(async () => {
    setCartError(null);
    setCartLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/cart/`);
      if (!res) {
        setCartItems([]);
        return;
      }
      if (!res.ok) {
        setCartError('Error al cargar el carrito');
        setCartItems([]);
        return;
      }
      const data = await res.json();
      setCartItems(enrichItems(data.items || []));
    } catch {
      setCartError('Error al cargar el carrito');
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [fetchWithAuth, enrichItems]);

  const addToCart = useCallback(async (courseOrId) => {
    const choreographyId = typeof courseOrId === 'object' ? courseOrId.id : courseOrId;
    setCartError(null);
    setCartAdding(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/cart/`, {
        method: 'POST',
        body: JSON.stringify({ choreography_id: choreographyId }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) {
        setCartError(data.detail || 'Error al añadir al carrito');
        return;
      }
      await refreshCart();
    } catch {
      setCartError('Error al añadir al carrito');
    } finally {
      setCartAdding(false);
    }
  }, [fetchWithAuth, refreshCart]);

  const removeFromCart = useCallback(async (choreographyId) => {
    setCartError(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/cart/${choreographyId}/`, {
        method: 'DELETE',
      });
      if (!res) return;
      if (!res.ok) {
        const data = await res.json();
        setCartError(data.detail || 'Error al eliminar del carrito');
        return;
      }
      await refreshCart();
    } catch {
      setCartError('Error al eliminar del carrito');
    }
  }, [fetchWithAuth, refreshCart]);

  const checkout = useCallback(async () => {
    setCartError(null);
    setCartCheckoutLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/academy/cart/checkout/`, {
        method: 'POST',
        body: JSON.stringify({ datos_facturacion: '' }),
      });
      if (!res) return null;
      const data = await res.json();
      if (!res.ok) {
        setCartError(data.detail || 'Error al procesar el pago');
        return null;
      }
      setCartItems([]);
      return data;
    } catch {
      setCartError('Error al procesar el pago');
      return null;
    } finally {
      setCartCheckoutLoading(false);
    }
  }, [fetchWithAuth]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback(
    (courseId) => cartItems.some((item) => item.id === courseId),
    [cartItems]
  );

  const getNumericPrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const cleaned = priceStr.replace(/\./g, '');
    return parseInt(cleaned, 10) || 0;
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + getNumericPrice(item.price), 0);

  const formatCOP = (value) => {
    const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted} COP`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartAdding,
        cartCheckoutLoading,
        cartError,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartTotal,
        formatCOP,
        refreshCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}

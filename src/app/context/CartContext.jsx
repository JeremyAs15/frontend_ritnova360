import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ritnova_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Error parsing cart from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ritnova_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (course) => {
    setCartItems((prevItems) => {
      // Evitar duplicados
      if (prevItems.some((item) => item.id === course.id)) {
        return prevItems;
      }
      return [...prevItems, course];
    });
  };

  const removeFromCart = (courseId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (courseId) => {
    return cartItems.some((item) => item.id === courseId);
  };

  // Convertir precios como "100.000" a número entero y sumarlos
  const getNumericPrice = (priceStr) => {
    if (!priceStr) return 0;
    // Si ya es un número, retornarlo
    if (typeof priceStr === 'number') return priceStr;
    // Quitar puntos decimales y convertir a entero
    const cleaned = priceStr.replace(/\./g, '');
    return parseInt(cleaned, 10) || 0;
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + getNumericPrice(item.price), 0);

  const formatCOP = (value) => {
    // Formatea 100000 en "$100.000"
    const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted} COP`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartTotal,
        formatCOP,
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

import { Analytics } from '@vercel/analytics/react';
import Router from './app/router/index';
import { CartProvider } from './app/context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router />
      <Analytics />
    </CartProvider>
  );
}

export default App;
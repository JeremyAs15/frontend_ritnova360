import { Analytics } from '@vercel/analytics/react';
import Router from './app/router/index';
import { CartProvider } from './app/context/CartContext';
import { ProfileProvider } from './app/context/ProfileContext';

function App() {
  return (
    <ProfileProvider>
      <CartProvider>
        <Router />
        <Analytics />
      </CartProvider>
    </ProfileProvider>
  );
}

export default App;
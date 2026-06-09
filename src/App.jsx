import { Analytics } from '@vercel/analytics/react';
import Router from './app/router/index';

function App() {
  return (
    <>
      <Router />
      <Analytics />
    </>
  );
}

export default App;
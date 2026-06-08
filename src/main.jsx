import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './app/styles/variables.css'
import './app/styles/forms.css'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '568297181305-3i5tf3p3oket5g91jihsh4vouinnnkn4.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos la aplicación con el proveedor */}
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
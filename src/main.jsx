import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/styles/variables.css'
import './app/styles/forms.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
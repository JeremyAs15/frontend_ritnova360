import { useState } from 'react';
import InputField from '../InputField/InputField';
import './PasswordInput.css';
 
function PasswordInput({ label, value, onChange, placeholder = '••••••••', error, hint, autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false);
 
  const lockIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
 
  const eyeOpen = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
 
  const eyeClosed = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
 
  return (
    <div className="password-input">
      {(label || hint) && (
        <div className="password-input__header">
          {label && <span className="password-input__label">{label}</span>}
          {hint && <span className="password-input__hint">{hint}</span>}
        </div>
      )}
 
      <div className="password-input__wrapper">
        <InputField
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          icon={lockIcon}
          error={error}
          autoComplete={autoComplete}
        />
 
        {/* Botón ojo */}
        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? eyeOpen : eyeClosed}
        </button>
      </div>
    </div>
  );
}
 
export default PasswordInput;
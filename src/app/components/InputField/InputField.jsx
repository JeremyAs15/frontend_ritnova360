import './InputField.css';

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  icon,
  error,
  invalid = false,
  disabled = false,
  autoComplete,
  inputMode,
}) {
  return (
    <div className={`input-field ${(error || invalid) ? 'input-field--error' : ''} ${disabled ? 'input-field--disabled' : ''}`}>
      {label && <label className="input-field__label">{label}</label>}

      <div className="input-field__wrapper">
        {icon && <span className="input-field__icon">{icon}</span>}
        <input
          className={`input-field__input ${icon ? 'input-field__input--with-icon' : ''}`}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
        />
      </div>

      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}

export default InputField;
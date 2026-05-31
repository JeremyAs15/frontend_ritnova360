import './InputField.css';

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  icon,
  error,
  disabled = false,
}) {
  return (
    <div className={`input-field ${error ? 'input-field--error' : ''} ${disabled ? 'input-field--disabled' : ''}`}>
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
        />
      </div>

      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}

export default InputField;
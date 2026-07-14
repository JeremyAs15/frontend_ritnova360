import './loader.css';

function Loader({ label = 'Cargando...', fullscreen = false, className = '' }) {
  return (
    <div className={`loader-wrap ${fullscreen ? 'loader-wrap--fullscreen' : ''} ${className}`.trim()}>
      <div className="loader-dots">
        <span className="loader-dots__d" />
        <span className="loader-dots__d" />
        <span className="loader-dots__d" />
        <span className="loader-dots__d" />
        <span className="loader-dots__d" />
      </div>
      {label && <p className="loader-label">{label}</p>}
    </div>
  );
}

export default Loader;
export { Loader };

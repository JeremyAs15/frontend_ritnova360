import React from 'react';

/**
 * Componente para renderizar los videos de las clases de forma segura.
 */
function VideoPlayer({ videoUrl, onProgressMark }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video shadow-md border border-slate-200">
      <video
        className="w-full h-full object-contain"
        src={videoUrl}
        controls
        controlsList="nodownload" // Propiedad estándar para mitigar descargas sencillas
        onPlay={onProgressMark}   // Callback para registrar progreso en tu endpoint "/videos/<id>/view/"
      >
        Tu navegador no soporta el formato de reproducción de video.
      </video>
    </div>
  );
}

export default VideoPlayer;
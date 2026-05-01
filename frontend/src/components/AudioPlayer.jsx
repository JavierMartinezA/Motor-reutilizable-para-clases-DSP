/**
 * <AudioPlayer>
 * =============
 * Reproductor genérico para archivos en `public/audio/`.
 * - HTML Audio API (sin Web Audio salvo que se pase un nodo externo).
 * - Debounce de 280 ms al cambiar de `src` (útil para sliders).
 * - Una única reproducción a la vez si se monta dentro de un grupo
 *   coordinado por el padre (el padre limpia con `pause()` cuando cambia).
 *
 * Props:
 *   src        string     ruta absoluta tipo "/audio/foo.wav"
 *   label      string     título mostrado
 *   sublabel   string     etiqueta secundaria mono caps
 *   accent     string     color (#hex) del botón. default "#374151"
 *   onPlay     fn         callback opcional al iniciar
 *   onEnd      fn         callback opcional al terminar
 *   debounceMs number     default 280; 0 desactiva debounce
 */

import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({
  src,
  label,
  sublabel = 'AUDIO',
  accent = '#374151',
  onPlay,
  onEnd,
  debounceMs = 280,
}) {
  const audioRef = useRef(null);
  const debounceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cargar audio (con debounce si cambia rápido).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const load = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      const a = new Audio(src);
      a.addEventListener('ended', () => {
        setIsPlaying(false);
        onEnd?.();
      });
      audioRef.current = a;
      setIsPlaying(false);
    };
    if (debounceMs > 0) {
      debounceRef.current = setTimeout(load, debounceMs);
    } else {
      load();
    }
    return () => {
      clearTimeout(debounceRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [src, debounceMs]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      onPlay?.();
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px',
      borderRadius: 14,
      border: '2px solid #e0ddd4',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <button
        onClick={toggle}
        style={{
          width: 42, height: 42,
          borderRadius: '50%',
          border: `2.5px solid ${accent}`,
          background: isPlaying ? accent : 'transparent',
          color: isPlaying ? '#fff' : accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        aria-label={isPlaying ? 'Pausa' : 'Reproducir'}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="4" height="10" rx="1" />
            <rect x="7" y="1" width="4" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
            <path d="M1 1.2v10.6L10.2 6.5 1 1.2z" />
          </svg>
        )}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16, fontWeight: 700, color: '#1a1a2e',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, color: '#9e9eb8',
            marginTop: 2, fontWeight: 600, letterSpacing: '0.1em',
          }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

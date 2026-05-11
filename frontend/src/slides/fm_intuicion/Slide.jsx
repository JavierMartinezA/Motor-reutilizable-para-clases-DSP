/**
 * Slide 02 — La Intuición · vibrato → timbre.
 *
 * Una sola vista interactiva (sin sub-pasos): el profesor mueve f_m de 1 → 500 Hz
 * para que el cerebro cruce el umbral de 20 Hz. La etiqueta VIBRATO/TIMBRE y los
 * dos canvases (forma de onda + espectro) reaccionan en tiempo real.
 *
 * Single internal "step" — no hay botones de navegación porque el slide entero
 * es una experiencia única. App.jsx maneja avanzar a la siguiente slide.
 */

import { useCallback, useEffect, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import {
  AMBER, BLUE, RED, INK, INK_MUTED, INK_FAINT,
  PillButton, LiveSpectrum, LiveWaveform, useFMEngine,
} from '../sintesis_fm/_shared.jsx';

export default function SlideIntuicion() {
  const [fm, setFm] = useState(5);
  const [playing, setPlaying] = useState(false);
  const engine = useFMEngine();
  const { ensure, setRawParams, play, stop, analyser } = engine;

  // Inicializa el contexto al montar y silencia al desmontar.
  useEffect(() => {
    ensure();
    return () => stop();
  }, [ensure, stop]);

  // Empuja parámetros siempre que f_m cambie (analyser ve la señal aunque mute=0).
  useEffect(() => {
    setRawParams({ fc: 220, fm, I: 5 });
  }, [fm, setRawParams]);

  const togglePlay = useCallback(() => {
    if (playing) { stop(); setPlaying(false); }
    else { setRawParams({ fc: 220, fm, I: 5 }); play(); setPlaying(true); }
  }, [playing, fm, setRawParams, play, stop]);

  const isVibrato = fm < 20;

  return (
    <SlideLayout
      sectionId="02"
      sectionLabel="Síntesis FM · Intuición"
      title={<>La síntesis FM nace de <em>engañar al oído</em></>}
      subtitle="Cruzando los ~20 Hz, el vibrato deja de oírse como ondulación de tono y se vuelve color sonoro."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 420 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.45fr', gap: 22, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
              El vibrato llevado al extremo
            </span>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14.5, color: INK_MUTED, lineHeight: 1.5, margin: 0 }}>
              Portadora fija en <strong style={{ color: BLUE }}>220 Hz</strong>. Mueve el slider
              de la moduladora <strong style={{ color: RED }}>f_m</strong> entre 1 Hz y 500 Hz.
            </p>
            <ul style={{ fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK, lineHeight: 1.5, margin: 0, paddingLeft: 20 }}>
              <li>
                <span style={{ color: RED, fontWeight: 700 }}>f_m ≈ 5–14 Hz</span>: vibrato — el cerebro
                sigue la oscilación de la altura como una nota que ondula.
              </li>
              <li style={{ marginTop: 6 }}>
                Cruza el umbral de <span style={{ color: AMBER, fontWeight: 700 }}>~20 Hz</span>: la
                percepción se quiebra. El oído ya no sigue la oscilación: la fusiona en un
                <strong> color sonoro nuevo</strong>.
              </li>
              <li style={{ marginTop: 6 }}>
                En el espectro, el pico deja de tambalearse y la energía se reparte
                instantáneamente hacia los lados — nacen las <strong style={{ color: AMBER }}>bandas laterales</strong>.
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
                  Dominio del tiempo · y(t)
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_FAINT }}>~370 ms</span>
              </div>
              <LiveWaveform analyser={analyser} accentColor={isVibrato ? RED : BLUE} height={120} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: INK_FAINT, textAlign: 'center' }}>
                {isVibrato
                  ? 'la portadora "respira": su período se estira y se comprime → escuchas vibrato'
                  : 'la onda se vuelve compleja pero estable → escuchas un timbre nuevo'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
                  Dominio de la frecuencia · |Y(f)|
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_FAINT }}>0 → 3.2 kHz</span>
              </div>
              <LiveSpectrum analyser={analyser} accentColor={isVibrato ? RED : BLUE} height={150} maxFreq={3200} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: INK_FAINT, textAlign: 'center' }}>
                f_c = 220 Hz · I = 5 · {playing ? 'sonando' : 'silenciado — pulsa ▶ para escuchar'}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 18, marginTop: 4,
          padding: '14px 20px', background: '#fffaf0',
          border: `1.5px solid ${isVibrato ? 'rgba(192,57,43,0.25)' : 'rgba(37,99,235,0.25)'}`,
          borderRadius: 12, transition: 'border-color 0.4s ease, background 0.4s ease',
        }}>
          <PillButton onClick={togglePlay} color={playing ? RED : AMBER}>
            {playing ? '■ Detener' : '▶ Reproducir'}
          </PillButton>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
                Frecuencia moduladora f_m
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: isVibrato ? RED : BLUE, fontWeight: 700 }}>
                {fm.toFixed(1)} Hz
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input type="range" min={1} max={500} step={0.5} value={fm}
                onChange={(e) => setFm(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: isVibrato ? RED : BLUE, height: 8 }} />
              <div style={{ position: 'absolute', left: `${(20 / 500) * 100}%`, top: -4, height: 18, width: 2, background: AMBER, opacity: 0.85, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: `${(20 / 500) * 100}%`, top: -22, transform: 'translateX(-50%)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: AMBER, fontWeight: 700, whiteSpace: 'nowrap' }}>
                umbral 20 Hz
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: INK_FAINT }}>
              <span>1 Hz</span><span>250 Hz</span><span>500 Hz</span>
            </div>
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: '0.12em',
            padding: '10px 18px', borderRadius: 50,
            background: isVibrato ? 'rgba(192,57,43,0.14)' : 'rgba(37,99,235,0.14)',
            color: isVibrato ? RED : BLUE, minWidth: 130, textAlign: 'center',
            border: `2px solid ${isVibrato ? RED : BLUE}`, transition: 'all 0.25s ease',
          }}>
            {isVibrato ? 'VIBRATO' : 'TIMBRE'}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

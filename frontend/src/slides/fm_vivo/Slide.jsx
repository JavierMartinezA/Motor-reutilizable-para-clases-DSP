/**
 * Slide 05 — El Plano FM en Vivo (port del demo_fm.html).
 *
 * Una sola vista interactiva. El profesor manipula sliders + presets para
 * mostrar la matriz Ratio × Índice esculpiendo el espectro en tiempo real.
 *
 * Sin navegación interna: la slide es una experiencia continua. Avanzar de
 * slide la maneja App.jsx.
 */

import { useCallback, useEffect, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import {
  AMBER, BLUE, RED, VIOLET, GREEN, INK, INK_MUTED, INK_FAINT,
  PillButton, Slider, LiveWaveform, LabSpectrum, useFMEngine,
  detectRational, RATIO_PRESETS, RatioPresetButton,
} from '../sintesis_fm/_shared.jsx';

export default function SlidePlanoVivo() {
  const [fc, setFc] = useState(220);
  const [ratio, setRatio] = useState(1.0);
  const [I, setI] = useState(2.0);
  const [playing, setPlaying] = useState(false);

  const engine = useFMEngine();
  const { ensure, setParams, play, stop, triggerPluck, analyser } = engine;

  // Setup + teardown (silencia al desmontar la slide).
  useEffect(() => {
    ensure();
    return () => stop();
  }, [ensure, stop]);

  // Empuja parámetros al motor con cada cambio de slider/preset.
  // El analyser está antes del masterGain → la visualización refleja
  // los sliders incluso cuando el bus está silenciado.
  useEffect(() => {
    setParams({ fc, ratio, I });
  }, [fc, ratio, I, setParams]);

  const togglePlay = useCallback(() => {
    if (playing) { stop(); setPlaying(false); }
    else { setParams({ fc, ratio, I }); play(); setPlaying(true); }
  }, [playing, fc, ratio, I, setParams, play, stop]);

  const handleTrigger = useCallback(() => {
    triggerPluck({ fc, ratio, I, duration: 1.6 });
  }, [fc, ratio, I, triggerPluck]);

  const fm = fc * ratio;
  const rationalMatch = detectRational(ratio);
  const isHarmonic = !!rationalMatch;
  const bandsEstim = 1 + 2 * Math.ceil(I + 1);

  let note;
  if (I < 0.5) note = <><strong>I muy bajo:</strong> casi un seno puro · cero brillo.</>;
  else if (isHarmonic && I < 4) note = <><strong>Armónico moderado:</strong> espectro tipo instrumento de viento.</>;
  else if (isHarmonic) note = <><strong>Armónico brillante:</strong> espectro denso pero "musical".</>;
  else if (I < 4) note = <><strong>Inarmónico suave:</strong> campana lejana.</>;
  else note = <><strong>Inarmónico brillante:</strong> gong, metal golpeado.</>;

  return (
    <SlideLayout
      sectionId="05"
      sectionLabel="Síntesis FM · Plano en vivo"
      title={<>El plano <em>Ratio × Índice</em>, en tus manos</>}
      subtitle="Manipula los sliders y los presets canónicos para esculpir el timbre en tiempo real."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 420 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, color: '#4ec3ff',
          background: '#08111d', padding: '10px 16px', borderRadius: 6,
          border: '1px solid #2b3747', textAlign: 'center', letterSpacing: '0.02em',
        }}>
          y(t) = sin(2π·<span style={{ color: BLUE }}>{fc.toFixed(0)}</span>·t + <span style={{ color: AMBER }}>{I.toFixed(1)}</span>·sin(2π·<span style={{ color: RED }}>{fm.toFixed(0)}</span>·t))
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
              Forma de onda · zoom 20 ms
            </span>
            <LiveWaveform analyser={analyser} accentColor="#4ec3ff" height={120} windowSamples={882} dark />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700, marginTop: 4 }}>
              Espectro · 0 – 4 kHz · escala dB
            </span>
            <LabSpectrum analyser={analyser} accentColor="#4ec3ff" height={210} fmax={4000} harmonicsF0={isHarmonic ? fc : null} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: INK_FAINT, textAlign: 'center' }}>
              {isHarmonic ? 'líneas naranjas = serie armónica de f_c' : 'sin marcas armónicas — espectro inarmónico'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Slider label="f_c · carrier" value={fc} min={55} max={880} step={1} onChange={setFc} color={BLUE} unit=" Hz" format={(v) => v.toFixed(0)} />
              <Slider label="ratio  f_m / f_c" value={ratio} min={0.1} max={5} step={0.001} onChange={setRatio} color={RED} format={(v) => v.toFixed(3)} />
              <Slider label="índice  I" value={I} min={0} max={15} step={0.1} onChange={setI} color={AMBER} format={(v) => v.toFixed(1)} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <PillButton onClick={togglePlay} color={playing ? RED : AMBER}>
                {playing ? '■ Stop' : '▶ Play continuo'}
              </PillButton>
              <PillButton onClick={handleTrigger} kind="outline" color={VIOLET}>
                ⚡ Trigger pluck
              </PillButton>
            </div>

            <div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
                snap a ratio
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6 }}>
                {RATIO_PRESETS.map((p) => (
                  <RatioPresetButton key={p.label} label={p.label}
                    active={Math.abs(ratio - p.ratio) < 0.002}
                    onClick={() => setRatio(p.ratio)} />
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: INK_MUTED,
              padding: '10px 12px', background: '#fbf8f1', borderRadius: 6,
              border: `1px solid ${INK_FAINT}`,
            }}>
              <span style={{ color: INK, fontWeight: 700 }}>f_m</span>
              <span>{fm.toFixed(1)} Hz</span>
              <span style={{ color: INK, fontWeight: 700 }}>bandas estim.</span>
              <span>1 + 2·{Math.ceil(I + 1)} = {bandsEstim}</span>
              <span style={{ color: INK, fontWeight: 700 }}>carácter</span>
              <span style={{ color: isHarmonic ? GREEN : RED, fontWeight: 700 }}>
                {isHarmonic ? `armónico (${rationalMatch[0]}:${rationalMatch[1]})` : 'inarmónico'}
              </span>
            </div>

            <div style={{
              padding: '10px 14px', background: '#fffbf2',
              borderLeft: `3px solid ${AMBER}`, borderRadius: 4,
              fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK, lineHeight: 1.5,
            }}>
              {note}
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

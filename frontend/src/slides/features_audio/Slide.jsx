/**
 * Clase 11 · MIR & Shazam — Slide 03 · Descriptores de Audio (lab en vivo)
 * Port del módulo "Features" de demo_mir.html: toca un sonido, ve ZCR /
 * centroide / rolloff / flatness / RMS reaccionar a la física.
 * Fuentes: presentacion (Slide 3) · slides_11.md (§2) · Marco Teórico (defs).
 */

import { useMemo, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, BLUE, RED, AMBER, GREEN, VIOLET,
  PillButton, FeatureWaveform, makeTestAudio, computeFeatures, useMirAudio,
} from '../_mir_shared.jsx';

const SOUNDS = [
  { id: 'violin', label: '🎻 Tono armónico', color: BLUE },
  { id: 'drum', label: '🥁 Percusivo', color: RED },
  { id: 'noise', label: '📡 Ruido blanco', color: INK_MUTED },
  { id: 'voice', label: '🗣️ Habla simulada', color: AMBER },
];

const FEATS = [
  { key: 'zcr', label: 'ZCR (cruces/s)', color: VIOLET, fmt: (v) => v.toFixed(0) },
  { key: 'centroid', label: 'Centroide', color: BLUE, fmt: (v) => `${v.toFixed(0)} Hz` },
  { key: 'rolloff', label: 'Rolloff 85%', color: GREEN, fmt: (v) => `${v.toFixed(0)} Hz` },
  { key: 'flatness', label: 'Flatness', color: RED, fmt: (v) => v.toFixed(3) },
  { key: 'rms', label: 'RMS', color: AMBER, fmt: (v) => v.toFixed(3) },
];

export default function SlideFeaturesAudio() {
  const [kind, setKind] = useState('violin');
  const { playBuffer } = useMirAudio();

  const audio = useMemo(() => makeTestAudio(kind), [kind]);
  const feats = useMemo(() => computeFeatures(audio), [audio]);

  const handle = (id) => { setKind(id); playBuffer(makeTestAudio(id)); };

  return (
    <SlideLayout
      sectionId="03"
      sectionLabel="MIR · Features"
      title={<>Extrayendo significado: <em>features</em> de audio</>}
      subtitle="Bajo nivel (ZCR, centroide, rolloff) → alto nivel (BPM, key, género). Toca un sonido y mira los números."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SOUNDS.map((s) => (
              <PillButton key={s.id} color={s.color} kind={kind === s.id ? 'solid' : 'outline'} onClick={() => handle(s.id)}>
                {s.label}
              </PillButton>
            ))}
          </div>
          <FeatureWaveform audio={audio} height={190} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: INK_FAINT, textAlign: 'center' }}>
            forma de onda (cian) + envolvente de energía RMS (naranja)
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <div style={{ flex: 1, background: '#08111d', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c7c7d6', fontWeight: 700, marginBottom: 6 }}>ZCR</div>
              <MathFormula t="\tfrac{1}{2(N-1)}\sum_n |\,\mathrm{sgn}\,x[n]-\mathrm{sgn}\,x[n\!-\!1]|\,f_s" color="#eef1f6" size={1.1} />
            </div>
            <div style={{ flex: 1, background: '#08111d', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c7c7d6', fontWeight: 700, marginBottom: 6 }}>Centroide · centro de masa</div>
              <MathFormula t="\mu_f = \frac{\sum_k \textcolor{#5b9bff}{f_k}\,|X_k|}{\sum_k |X_k|}" color="#eef1f6" size={1.25} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            Valores en vivo
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FEATS.map((f) => (
              <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 16px', borderRadius: 8, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: INK_MUTED }}>{f.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 21, fontWeight: 700, color: f.color }}>{f.fmt(feats[f.key])}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 18px', background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`, borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: INK, lineHeight: 1.55 }}>
            <strong>ZCR alto</strong> → percusión/agudos. <strong>Centroide alto</strong> → brillo (hi-hat).
            {' '}<strong>Flatness ≈ 1</strong> → ruido (espectro plano); <strong>≈ 0</strong> → tonal (armónico).
            <br /><span style={{ color: INK_MUTED }}>Con 3–5 features así puedes clasificar audios con un k-NN. Alto nivel = agregarlos (MFCCs + ML).</span>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

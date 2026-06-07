/**
 * Clase 11 · MIR & Shazam — Slide 08 · Fun Task y los límites del algoritmo
 * Presenta la Fun Task 11 (3 tracks) + los puntos ciegos + curva esquemática
 * precisión-vs-SNR (simple vs histograma, quiebre 5–10 dB más abajo).
 * Fuentes: presentacion (Slide 8) · fun_task_11.md · slides_11.md (§5).
 */

import SlideLayout from '../../components/SlideLayout';
import { INK, INK_MUTED, INK_FAINT, VIOLET, RED, GREEN, AMBER, BLUE } from '../_mir_shared.jsx';

const TRACKS = [
  { n: '1', title: 'Tu base de datos', desc: '≥ 5 canciones reconocibles (sintéticas con tus motores S08–S10 o reales). Guarda los fingerprints en db.json.', color: BLUE },
  { n: '2', title: 'Curva precisión vs SNR', desc: 'Queries a +30…−10 dB. Compara match_simple vs match_with_histogram. El histograma rompe 5–10 dB más abajo.', color: VIOLET },
  { n: '3', title: '"Rompe tu Shazam"', desc: 'Transposición, tempo ±5/10/20%, lowpass 1 kHz, eco 100 ms, mezcla con voz. ¿Dónde y por qué deja de funcionar?', color: RED },
];

const ATTACKS = [
  ['Transposición ½ tono', 'f₁, f₂ se desplazan → cambia toda la llave del diccionario', RED],
  ['Cambio de tempo', 'los Δt se escalan → los hashes ya no calzan', RED],
  ['Reverb / eco severo', 'picos "fantasma" ensucian la constelación', AMBER],
  ['Lowpass 1 kHz', 'sobrevive: los picos graves siguen siendo máximos locales', GREEN],
];

// curva esquemática ratio-vs-SNR (no datos reales; ilustra el quiebre)
function Curve() {
  const W = 360, H = 200, pad = 34;
  const xs = [30, 20, 10, 0, -5, -10, -15, -20];
  const xToPx = (snr) => pad + (30 - snr) / 50 * (W - pad - 8);
  const yToPx = (r) => H - pad - (r - 1) / 4 * (H - pad - 12);
  const hist = [3.9, 3.8, 3.5, 3.1, 2.4, 1.7, 1.15, 1.0];
  const simple = [3.6, 3.0, 2.2, 1.5, 1.12, 1.0, 1.0, 1.0];
  const path = (ys) => xs.map((s, i) => `${i ? 'L' : 'M'}${xToPx(s).toFixed(1)},${yToPx(ys[i]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={pad} y1={H - pad} x2={W - 6} y2={H - pad} stroke="#cfcabd" strokeWidth="1" />
      <line x1={pad} y1={12} x2={pad} y2={H - pad} stroke="#cfcabd" strokeWidth="1" />
      <line x1={pad} y1={yToPx(1)} x2={W - 6} y2={yToPx(1)} stroke={INK_FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <text x={W - 8} y={yToPx(1) - 5} fontSize="9" fill={INK_FAINT} fontFamily="monospace" textAnchor="end">ratio = 1 (ambiguo)</text>
      <path d={path(simple)} fill="none" stroke={INK_MUTED} strokeWidth="2" />
      <path d={path(hist)} fill="none" stroke={VIOLET} strokeWidth="2.5" />
      <text x={xToPx(30)} y={H - pad + 14} fontSize="9" fill={INK_MUTED} fontFamily="monospace">+30</text>
      <text x={xToPx(0)} y={H - pad + 14} fontSize="9" fill={INK_MUTED} fontFamily="monospace">0</text>
      <text x={xToPx(-20)} y={H - pad + 14} fontSize="9" fill={INK_MUTED} fontFamily="monospace">−20 dB</text>
      <text x={pad - 6} y={yToPx(3.5)} fontSize="9" fill={INK_MUTED} fontFamily="monospace" textAnchor="end">ratio</text>
      <circle cx={xToPx(30)} cy={yToPx(hist[0])} r="3" fill={VIOLET} />
      <text x={xToPx(20)} y={yToPx(3.9)} fontSize="10" fill={VIOLET} fontFamily="monospace" fontWeight="700">histograma</text>
      <text x={xToPx(15)} y={yToPx(1.9)} fontSize="10" fill={INK_MUTED} fontFamily="monospace" fontWeight="700">simple</text>
    </svg>
  );
}

export default function SlideLimitesShazam() {
  return (
    <SlideLayout
      sectionId="08"
      sectionLabel="MIR · Fun Task & Límites"
      title={<>Rompiendo nuestro propio <em>Shazam</em></>}
      subtitle="Fun Task 11: implementar un Mini-Shazam, medir su curva precisión-vs-SNR y romperlo a propósito."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            Tres tracks paralelos
          </span>
          {TRACKS.map((t) => (
            <div key={t.n} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, alignItems: 'start', padding: '11px 14px', borderRadius: 10, background: '#fbf9f5', border: `1px solid ${t.color}33` }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: t.color }}>{t.n}</span>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 700, color: INK }}>{t.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK_MUTED, lineHeight: 1.4, marginTop: 2 }}>{t.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: INK, background: '#f0ece2', padding: '6px 10px', borderRadius: 6 }}>tol = ±2 bins, ±1 frame</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: INK, background: '#f0ece2', padding: '6px 10px', borderRadius: 6 }}>cada decisión lleva [WHY]</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            Curva esquemática · ratio vs SNR
          </span>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8e3d8', padding: 8 }}><Curve /></div>

          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700, marginTop: 2 }}>
            ¿Dónde falla? — puntos ciegos
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ATTACKS.map(([a, why, c]) => (
              <div key={a} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, alignItems: 'baseline', padding: '7px 12px', borderRadius: 8, background: '#fbf9f5', borderLeft: `3px solid ${c}` }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700, color: INK }}>{a}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: INK_MUTED, lineHeight: 1.35 }}>{why}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

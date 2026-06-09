/**
 * Clase 11 · MIR & Shazam — Slide 10 · Rompiendo nuestro propio Shazam
 * ===================================================================
 * "Break it": baja el SNR en vivo hasta que la identificación falle. Se ancla
 * con los datos reales de Wang (2003, Figs. 4–5): 50% de reconocimiento a
 * −9/−6/−3 dB para 15/10/5 s. Más los puntos ciegos estructurales y el puente
 * a la Fun Task 11.
 *
 * Embebe <Ruido /> de _mir_modules.jsx (slider SNR −20…+30 dB, identificar).
 */

import SlideLayout from '../../components/SlideLayout';
import { INK, INK_MUTED, INK_FAINT, VIOLET, RED, GREEN, AMBER, BLUE, useMirAudio } from '../_mir_shared.jsx';
import { Ruido } from '../_mir_modules.jsx';

const BLIND = [
  ['Transposición ½ tono', 'f₁,f₂ saltan de bin → cambia toda la llave', RED],
  ['Cambio de tempo', 'los Δt se escalan → los hashes no calzan', RED],
  ['Reverb / eco severo', 'picos "fantasma" ensucian la constelación', AMBER],
  ['Lowpass 1 kHz', 'sobrevive: los graves siguen siendo máximos', GREEN],
];

export default function SlideLimitesShazam() {
  const audio = useMirAudio();

  return (
    <SlideLayout
      sectionId="10"
      sectionLabel="MIR · Robustez y límites"
      title={<>Robustez y <em>modos de falla</em></>}
      subtitle="Reduce el SNR hasta provocar el fallo. Resiste más de lo esperado: los pares codifican geometría tiempo–frecuencia, no energía absoluta."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Banner: anclaje empírico Wang + puntos ciegos + Fun Task */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.25fr 0.9fr', gap: 12, alignItems: 'stretch' }}>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#eef4fc', border: `1px solid ${BLUE}44` }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: BLUE, fontWeight: 800 }}>Wang 2003 · Fig. 4</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK, lineHeight: 1.4, marginTop: 3 }}>
              50% de reconocimiento a <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>−9 / −6 / −3 dB</strong> para muestras de 15 / 10 / 5 s.
            </div>
          </div>
          <div style={{ padding: '8px 12px', borderRadius: 10, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 800, marginBottom: 3 }}>puntos ciegos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
              {BLIND.map(([a, , c]) => (
                <div key={a} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span style={{ color: c, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{c === GREEN ? '✓' : '✗'}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: INK }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: VIOLET, fontWeight: 800 }}>Fun Task 11</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.35, marginTop: 2 }}>
              Tu Mini-Shazam: curva precisión vs SNR + "rompe tu Shazam".
            </div>
          </div>
        </div>

        <Ruido audio={audio} />
      </div>
    </SlideLayout>
  );
}

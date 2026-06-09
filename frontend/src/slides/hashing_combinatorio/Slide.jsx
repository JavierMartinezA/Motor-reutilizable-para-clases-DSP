/**
 * Clase 11 · MIR & Shazam — Slide 08 · Hashing combinatorio + índice invertido
 * ============================================================================
 * IDENTIFICAR, paso 2. Un pico solo es ambiguo (~10 bits; muchas canciones
 * comparten un pico en 440 Hz). La genialidad: emparejar ancla→target en
 * (f₁, f₂, Δt). Δt es relativo → invarianza traslacional; ~30 bits → enorme
 * especificidad. Y el eslabón que faltaba: el hash es una LLAVE que indexa una
 * tabla invertida → búsqueda O(1), speedup ≈ 10⁶/F² (Wang 2003 §2.4.2).
 *
 * Llena la rúbrica IDENTIFICAR: ✅ Invariancia traslacional + ✅ Entropía.
 * Embebe <Hashes /> de _mir_modules.jsx (ancla, fan-out, zona objetivo).
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import { INK, INK_MUTED, INK_FAINT, VIOLET, GREEN, BLUE, AMBER, RED, PillButton } from '../_mir_shared.jsx';
import { Hashes } from '../_mir_modules.jsx';

export default function SlideHashingCombinatorio() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="09"
      sectionLabel="MIR · Hashing"
      title={<>De picos a <em>hashes</em> — y a búsqueda O(1)</>}
      subtitle="Un pico solo es frágil y ambiguo. Un par (ancla→target) es una llave estable que indexa millones de canciones."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Banner compacto: la llave + el índice invertido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, alignItems: 'stretch' }}>
          <div style={{ background: '#08111d', borderRadius: 10, padding: '10px 14px', color: '#e3d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MathFormula t="H=(\textcolor{#5b9bff}{f_1},\textcolor{#4ade80}{f_2},\textcolor{#fbbf24}{\Delta t})\ \to\ (\text{ID},\,t_1)" color="#e3d4ff" size={1.02} display />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 6px', borderRadius: 8, background: '#f3eefc' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 800, color: VIOLET }}>≈30 bits</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED }}>vs 10 de un pico</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 6px', borderRadius: 8, background: '#eefcf2' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 800, color: GREEN }}>O(1)</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED }}>look-up por hash</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 6px', borderRadius: 8, background: '#eef4fc' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 800, color: BLUE }}>10⁶/F²</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED }}>speedup</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK_MUTED, lineHeight: 1.45 }}>
            <strong style={{ color: INK }}>Δt es relativo</strong>, no la hora absoluta → el hash es el mismo empieces donde empieces a grabar.
            El hash es la <strong style={{ color: INK }}>llave</strong> de un índice invertido <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>{'{H → [(ID,t₁)…]}'}</code>: buscar millones de canciones es un look-up, no una comparación.
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: '#eefcf2', border: `1px solid ${GREEN}55` }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: GREEN }}>✓</span>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.3 }}>
              rúbrica <strong style={{ color: VIOLET }}>IDENTIFICAR</strong>:<br />Invariancia · Entropía
            </div>
          </div>
        </div>
        <Hashes />

        {/* ─── Cliffhanger: ¿solución definitiva? (step 1) ─── */}
        {step >= 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 18px', borderRadius: 10,
            background: '#fff5f5', border: `1.5px solid ${RED}55`,
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 900,
              color: RED, lineHeight: 1, flexShrink: 0,
            }}>NO.</span>
            <img
              src="/imagenes/cerebro_musica.png"
              alt="cerebro"
              style={{ width: 90, height: 'auto', flexShrink: 0, opacity: 0.88 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: 15.5, fontWeight: 600, color: INK }}>
                ¿Es esta la solución definitiva?
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK_MUTED, lineHeight: 1.45, marginTop: 3 }}>
                H guarda <em>hercios absolutos</em> — transpón el audio y la llave cambia por completo.
                Tu cerebro hace algo más inteligente.{' '}
                <strong style={{ color: RED }}>Lo vemos más adelante.</strong>
              </div>
            </div>
          </div>
        )}

        {/* ─── Botón de paso ─── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PillButton
            color={step === 1 ? RED : VIOLET}
            kind="solid"
            onClick={() => setStep(s => (s + 1) % 2)}
          >
            {step === 0 ? '¿Solución definitiva? →' : '← Reiniciar'}
          </PillButton>
        </div>
      </div>
    </SlideLayout>
  );
}

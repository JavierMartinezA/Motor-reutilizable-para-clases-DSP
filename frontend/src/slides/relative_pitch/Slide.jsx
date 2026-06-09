/**
 * Clase 11 · MIR & Shazam — Slide 11b · Invariancia al tono (hash relativo)
 * =========================================================================
 * Coda del fingerprinting. Primero el oyente ESCUCHA el motivo de Star Wars
 * en dos alturas (original y una octava arriba) y reconoce que es la misma
 * canción. Luego la disonancia: la máquina (Wang) guarda hercios absolutos y
 * falla; el cerebro (y AcoustID/Chroma) guarda la PROPORCIÓN — la Quinta
 * Justa 1,5 — y acierta. Octava = todo ×2, pero la proporción no cambia.
 *
 * Audio: síntesis client-side (Web Audio API) del motivo, sin assets .wav.
 */

import { useRef, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import { INK, INK_MUTED, VIOLET, GREEN, RED, AMBER, PillButton } from '../_mir_shared.jsx';

// Main Title de Star Wars (John Williams), incipit real:
//   Re·Re·Re (tresillo) → Sol → Re → Do·Si·La (tresillo) → Sol agudo → Re
// Registro base elegido para que el salto Sol→Re del tema caiga en 196→294
// (fila "Original" de la tabla) y, una octava arriba (×2), en 392→588
// (fila "+1 octava"). Así el audio y la pizarra quedan alineados.
const MOTIF = [
  { f: 146.83, d: 0.16 }, // Re  (D3) ·\
  { f: 146.83, d: 0.16 }, // Re  (D3) · } tresillo de anacrusa "ta-ta-ta"
  { f: 146.83, d: 0.16 }, // Re  (D3) ·/
  { f: 196.00, d: 0.66 }, // Sol (G3) — larga  ┐ salto Sol→Re =
  { f: 293.66, d: 0.66 }, // Re  (D4) — larga  ┘ Quinta Justa (196→294 = ×1,5)
  { f: 261.63, d: 0.17 }, // Do  (C4) ·\
  { f: 246.94, d: 0.17 }, // Si  (B3) · } tresillo descendente
  { f: 220.00, d: 0.17 }, // La  (A3) ·/
  { f: 392.00, d: 0.66 }, // Sol agudo (G4) — larga
  { f: 293.66, d: 0.50 }, // Re  (D4) — reposo
];

function playMotif(mult, setBusy) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.85;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3800;
  master.connect(lp).connect(ctx.destination);

  let t = ctx.currentTime + 0.06;
  for (const { f, d } of MOTIF) {
    const freq = f * mult;
    const g = ctx.createGain();
    g.connect(master);
    const atk = 0.02, rel = 0.09;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + atk);
    g.gain.setValueAtTime(0.32, t + Math.max(atk, d - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    // Timbre con brillo de metal: triangular (fundamental) + seno una octava arriba.
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.16;
    o1.connect(g);
    o2.connect(g2).connect(g);
    o1.start(t); o2.start(t);
    o1.stop(t + d + 0.05); o2.stop(t + d + 0.05);
    t += d;
  }
  const totalMs = (t - ctx.currentTime + 0.25) * 1000;
  setBusy(mult);
  setTimeout(() => { setBusy(null); ctx.close(); }, totalMs);
}

const HzPair = ({ a, b, color }) => (
  <span style={{
    fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700,
    color, background: '#fff', border: `1px solid ${color}44`,
    padding: '3px 11px', borderRadius: 6, whiteSpace: 'nowrap',
  }}>
    ({a}, {b}) Hz
  </span>
);

const STEPS = [
  '① ¿Por qué la máquina falla? →',
  '② ¿Cómo lo hace tu cerebro? →',
  '← Reiniciar',
];

export default function SlideRelativePitch() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(null); // 1 = original, 2 = octava
  const guard = useRef(false);

  const play = (mult) => {
    if (busy) return;
    if (guard.current) return;
    guard.current = true;
    setTimeout(() => { guard.current = false; }, 200);
    playMotif(mult, setBusy);
  };

  return (
    <SlideLayout
      sectionId="11b"
      sectionLabel="MIR · Invariancia al tono"
      title={<>Si subo el tono, ¿sigue siendo <em>la misma canción</em>?</>}
      subtitle="El hash de Wang guarda hercios exactos y se rompe al transponer. Tu cerebro —y AcoustID— guarda proporciones. Primero, escúchalo."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

        {/* ─── HERO: escuchar el motivo en dos alturas ─── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 18, padding: '13px 20px', borderRadius: 12,
          background: '#f3eefc', border: `1.5px solid ${VIOLET}55`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 600, color: INK }}>
              El motivo de <em>Star Wars</em>, en dos alturas
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED }}>
              Tu oído la reconoce igual. ¿Por qué una máquina no?
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <PillButton color={GREEN} kind={busy === 1 ? 'solid' : 'outline'} onClick={() => play(1)}>
              {busy === 1 ? '♪ sonando…' : '▶ Tono original'}
            </PillButton>
            <PillButton color={AMBER} kind={busy === 2 ? 'solid' : 'outline'} onClick={() => play(2)}>
              {busy === 2 ? '♪ sonando…' : '▶ Una octava más arriba ↑'}
            </PillButton>
          </div>
        </div>

        {/* ─── DOS PANELES: la máquina falla · el cerebro acierta ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* LEFT — Shazam / Wang: hash absoluto → falla (step 1) */}
          <div style={{
            position: 'relative', borderRadius: 12, padding: '15px 18px',
            background: step >= 1 ? '#fbeeee' : '#f7f5f0',
            border: `1.5px solid ${step >= 1 ? RED + '66' : '#e0ddd4'}`,
            opacity: step >= 1 ? 1 : 0.5, transition: 'all 0.4s',
            display: 'flex', flexDirection: 'column', gap: 11,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: step >= 1 ? RED : '#cfcabd', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800, transition: 'background 0.4s',
              }}>✗</span>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14.5, color: INK }}>
                  Shazam guarda los <span style={{ color: RED }}>hercios</span>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: INK_MUTED }}>
                  hash absoluto · Wang 2003
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.45s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: GREEN, minWidth: 64 }}>Original</span>
                <HzPair a={196} b={294} color={GREEN} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: AMBER, minWidth: 64 }}>+1 octava</span>
                <HzPair a={392} b={588} color={AMBER} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_MUTED }}>← todo ×2</span>
              </div>
              <div style={{
                marginTop: 2, padding: '8px 12px', borderRadius: 8,
                background: '#fff', border: `1.5px solid ${RED}44`,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: RED,
                textAlign: 'center',
              }}>
                (196, 294) ≠ (392, 588) → otro hash
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.45, textAlign: 'center' }}>
                Cambian los hercios → <strong>no la reconoce</strong>.
              </div>
            </div>
          </div>

          {/* RIGHT — Cerebro / AcoustID: hash relativo → acierta (step 2) */}
          <div style={{
            borderRadius: 12, padding: '15px 18px',
            background: step >= 2 ? '#eefcf2' : '#f7f5f0',
            border: `1.5px solid ${step >= 2 ? GREEN + '66' : '#e0ddd4'}`,
            opacity: step >= 2 ? 1 : 0.5, transition: 'all 0.4s',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: step >= 2 ? GREEN : '#cfcabd', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, transition: 'background 0.4s',
              }}>✓</span>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14.5, color: INK }}>
                  Tu cerebro guarda la <span style={{ color: GREEN }}>proporción</span>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: INK_MUTED }}>
                  hash relativo · AcoustID / MusicBrainz
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.5s' }}>
              <img
                src="/imagenes/cerebro_musica.png"
                alt="Notas musicales fluyendo hacia un cerebro"
                style={{ width: 118, height: 'auto', flexShrink: 0, opacity: 0.92 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, color: INK }}>294 ÷ 196 =</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 800, color: GREEN }}>1,5</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, color: INK }}>588 ÷ 392 =</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 800, color: GREEN }}>1,5</span>
                </div>
                <div style={{
                  marginTop: 2, padding: '5px 10px', borderRadius: 7,
                  background: '#fff', border: `1.5px solid ${GREEN}44`,
                  fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK,
                }}>
                  misma <strong style={{ color: GREEN }}>Quinta Justa</strong> → <strong>la reconoce</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Cierre · AcoustID (step 2) ─── */}
        <div style={{
          opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.55s',
          padding: '9px 16px', borderRadius: 9,
          background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`,
          fontFamily: "'Newsreader', serif", fontSize: 14, fontStyle: 'italic',
          color: INK, lineHeight: 1.5,
        }}>
          <strong style={{ fontStyle: 'normal', color: VIOLET }}>AcoustID</strong> (el motor de MusicBrainz)
          hace justo esto: <em>relative-pitch hashes</em> y <em>Chroma features</em>. Al guardar
          proporciones y no hercios, queda invariante a la transposición — como tu oído.
        </div>

        {/* ─── Botón de pasos ─── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PillButton
            color={step === 2 ? RED : VIOLET}
            kind="solid"
            onClick={() => setStep(s => (s + 1) % 3)}
          >
            {STEPS[step]}
          </PillButton>
        </div>
      </div>
    </SlideLayout>
  );
}

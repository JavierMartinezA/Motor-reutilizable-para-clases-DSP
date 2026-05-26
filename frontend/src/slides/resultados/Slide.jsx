/**
 * Slide 05 — Resultados.
 *
 * Mitad izquierda: tabla de resultados + curva de aprendizaje SAC.
 * Mitad derecha: subtítulo "cómo se generó el target" + espectrogramas
 * Target vs Predicción + 2 audios + hallazgo central (degeneración).
 */

import SlideLayout from '../../components/SlideLayout';
import AudioPlayer from '../../components/AudioPlayer';

const BLUE = '#2563eb';
const RED = '#c0392b';
const AMBER = '#d97706';
const VIOLET = '#7c3aed';
const GREEN = '#16a34a';
const INK = '#1a1a2e';
const INK_MUTED = '#6b6b8a';
const INK_FAINT = '#9e9eb8';

const RESULTS = [
  { param: 'f_c (Hz)', target: '440.0', sac: '432.4', verdict: '< 2%', icon: '✅', color: GREEN },
  { param: 'ratio',    target: '3.500', sac: '1.006', verdict: '2.49', icon: '❌', color: RED },
  { param: 'I',        target: '8.000', sac: '9.467', verdict: '1.47', icon: '⚠️', color: AMBER },
  { param: 'feedback', target: '0.600', sac: '0.849', verdict: '0.25', icon: '✓',  color: INK_MUTED },
  { param: 'A (s)',    target: '0.300', sac: '0.481', verdict: '0.18', icon: '✓',  color: INK_MUTED },
  { param: 'D (s)',    target: '0.200', sac: '0.289', verdict: '0.09', icon: '✓',  color: INK_MUTED },
  { param: 'S',        target: '0.500', sac: '0.612', verdict: '0.11', icon: '✓',  color: INK_MUTED },
  { param: 'R (s)',    target: '0.400', sac: '0.347', verdict: '0.05', icon: '✓',  color: INK_MUTED },
];

export default function SlideResultados() {
  return (
    <SlideLayout
      sectionId="05"
      sectionLabel="Resultados · hallazgo central"
      title={<>Resultados: <em style={{ color: GREEN }}>lo que funcionó</em> y <em style={{ color: RED }}>lo que no</em>.</>}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 22,
        maxWidth: 1180, margin: '0 auto', width: '100%', alignItems: 'start',
      }}>

        {/* MITAD IZQUIERDA — Tabla + curva de aprendizaje */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '0.95fr 0.75fr 0.75fr 0.7fr',
            gap: 0,
            border: `1px solid ${INK_FAINT}55`, borderRadius: 8, overflow: 'hidden',
          }}>
            {['Parámetro', 'Target', 'SAC', 'Error'].map((h) => (
              <div key={h} style={{
                padding: '8px 12px', background: '#f1efe7',
                fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700,
                borderBottom: `1px solid ${INK_FAINT}55`,
              }}>{h}</div>
            ))}
            {RESULTS.map((r, i) => (
              <ResultRow key={r.param} {...r} last={i === RESULTS.length - 1} />
            ))}
          </div>

          {/* Recompensa final destacada */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px', borderRadius: 8,
            border: `2px solid ${VIOLET}`, background: '#f5f0fb',
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: VIOLET, fontWeight: 700,
            }}>Recompensa final</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: VIOLET, fontWeight: 700,
            }}>r = 0.294</span>
          </div>

          {/* Curva de aprendizaje */}
          <div style={{
            background: '#fff', borderRadius: 8, padding: 6,
            border: '1px solid #e0ddd4',
          }}>
            <img
              src="/imagenes/sac_reward_curve.png"
              alt="Curva de aprendizaje SAC: recompensa acumulada ~4 → ~9.3 en 2000 episodios"
              style={{ width: '100%', display: 'block', borderRadius: 4 }}
            />
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700,
              textAlign: 'center', padding: '4px 0 2px',
            }}>
              Curva SAC · 2000 ep. · <span style={{ color: GREEN }}>el agente aprende</span>
            </div>
          </div>
        </div>

        {/* MITAD DERECHA — Cómo se generó el target + espectrogramas + audios + hallazgo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Subtítulo "cómo se generó el target" */}
          <div style={{
            padding: '8px 14px', borderLeft: `3px solid ${AMBER}`,
            background: 'rgba(255,255,255,0.6)', borderRadius: 4,
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: AMBER, fontWeight: 700,
            }}>Cómo se generó el target</span>
            <p style={{
              fontFamily: "'Newsreader', serif", fontSize: 12.5, color: INK_MUTED,
              lineHeight: 1.4, margin: '3px 0 0',
            }}>
              Se fijó manualmente <code style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER, fontSize: 11 }}>θ_tgt = [440 Hz, ratio=3.5, I=8.0, fb=0.6, A=0.3, D=0.2, S=0.5, R=0.4]</code> y se sintetizó con el mismo motor FM. El agente <em>nunca</em> vio estos parámetros — solo escuchó el audio resultante.
            </p>
          </div>

          {/* Espectrogramas Target vs Predicción */}
          <div style={{
            background: '#fff', borderRadius: 8, padding: 6,
            border: '1px solid #e0ddd4',
          }}>
            <img
              src="/imagenes/sac_spectrograms.png"
              alt="Espectrogramas Target (bandas inarmónicas) vs Predicción SAC (bandas armónicas densas)"
              style={{ width: '100%', display: 'block', borderRadius: 4 }}
            />
          </div>

          {/* Dos audios lado a lado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <AudioPlayer
              src="/audio/sac_target.wav"
              label="Target"
              sublabel="OBJETIVO"
              accent={INK}
            />
            <AudioPlayer
              src="/audio/sac_pred.wav"
              label="Predicción SAC"
              sublabel="AGENTE"
              accent={VIOLET}
            />
          </div>

          {/* Hallazgo central */}
          <div style={{
            padding: '10px 14px', borderLeft: `3px solid ${RED}`,
            background: '#fdf3f1', borderRadius: 4,
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: RED, fontWeight: 700,
            }}>Hallazgo central · degeneración de la recompensa</span>
            <p style={{
              fontFamily: "'Newsreader', serif", fontSize: 12.5, color: INK_MUTED,
              lineHeight: 1.45, margin: '4px 0 0',
            }}>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }}>ratio=1.0</code> + <code style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }}>I=9.47</code> genera un espectro armónico que produce MAE similar al objetivo inarmónico. <strong style={{ color: INK, fontStyle: 'italic' }}>Sonidos distintos → descriptores similares.</strong> Confirma Salimi et al. (2024).
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function ResultRow({ param, target, sac, verdict, icon, color, last }) {
  return (
    <>
      <Cell mono bold last={last}>{param}</Cell>
      <Cell mono last={last}>{target}</Cell>
      <Cell mono color={color} last={last}>{sac}</Cell>
      <Cell color={color} last={last}>
        <span style={{ marginRight: 4 }}>{icon}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{verdict}</span>
      </Cell>
    </>
  );
}

function Cell({ children, mono = false, bold = false, color = INK, last = false }) {
  return (
    <div style={{
      padding: '7px 12px',
      borderBottom: last ? 'none' : `1px solid ${INK_FAINT}33`,
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Newsreader', serif",
      fontSize: mono ? 12.5 : 13,
      fontWeight: bold ? 700 : 400,
      color,
      display: 'flex', alignItems: 'center',
    }}>{children}</div>
  );
}

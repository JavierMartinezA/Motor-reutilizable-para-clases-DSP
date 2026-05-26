/**
 * Slide 02 — El Problema: Sound Matching en FM.
 *
 * Flujo horizontal → bullets → imagen real de espectrogramas + 2 audios
 * (ratio 1.0 vs ratio 3.5).
 */

import SlideLayout from '../../components/SlideLayout';
import AudioPlayer from '../../components/AudioPlayer';

const BLUE = '#2563eb';
const RED = '#c0392b';
const AMBER = '#d97706';
const VIOLET = '#7c3aed';
const INK = '#1a1a2e';
const INK_MUTED = '#6b6b8a';

export default function SlideSoundMatchingFM() {
  return (
    <SlideLayout
      sectionId="02"
      sectionLabel="El problema · Sound matching"
      title={<>¿Qué es <em style={{ color: VIOLET }}>Sound Matching</em> y por qué es difícil en FM?</>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Flujo horizontal */}
        <FlowDiagram />

        {/* Dos bullets concisos */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          maxWidth: 1100, margin: '0 auto', width: '100%',
        }}>
          <BulletCard
            kicker="Definición"
            color={VIOLET}
            title="Sound Matching"
            body={<>Dado un audio objetivo, encontrar automáticamente los <strong>parámetros del sintetizador</strong> que lo repliquen.</>}
          />
          <BulletCard
            kicker="La dificultad"
            color={RED}
            title="Espacio paramétrico no lineal"
            body={<>Un pequeño cambio en <code style={{ color: AMBER, fontFamily: "'JetBrains Mono', monospace" }}>ratio</code> o en el índice <code style={{ color: AMBER, fontFamily: "'JetBrains Mono', monospace" }}>I</code> bifurca el espectro: pasa de <strong style={{ color: BLUE }}>armónico</strong> a <strong style={{ color: RED }}>inarmónico</strong>.</>}
          />
        </div>

        {/* Imagen real de espectrogramas + dos audios */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20,
          maxWidth: 1100, margin: '0 auto', width: '100%', alignItems: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 8,
            border: '1px solid #e0ddd4',
          }}>
            <img
              src="/imagenes/slide_espectrogramas.png"
              alt="Espectrogramas comparativos: ratio = 1.0 (armónico) vs ratio = 3.5 (inarmónico)"
              style={{ width: '100%', display: 'block', borderRadius: 6 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AudioPlayer
              src="/audio/slide_ratio_1.0.wav"
              label="ratio = 1.0"
              sublabel="ARMÓNICO · ORDENADO"
              accent={BLUE}
            />
            <AudioPlayer
              src="/audio/slide_ratio_3.5.wav"
              label="ratio = 3.5"
              sublabel="INARMÓNICO · CAÓTICO"
              accent={RED}
            />
            <p style={{
              fontFamily: "'Newsreader', serif", fontSize: 13, color: INK_MUTED,
              fontStyle: 'italic', lineHeight: 1.4, margin: 0,
            }}>
              Mismos parámetros excepto <code style={{ color: AMBER, fontFamily: "'JetBrains Mono', monospace" }}>ratio</code>: <strong>1.0 → 3.5</strong>.
            </p>
          </div>
        </div>

        {/* Conclusión */}
        <p style={{
          fontFamily: "'Newsreader', serif", fontSize: 15.5, color: INK_MUTED,
          fontStyle: 'italic', textAlign: 'center', margin: '2px auto 0', maxWidth: 920,
        }}>
          No se puede usar <strong style={{ color: RED }}>gradiente directo</strong> →
          se necesita <strong style={{ color: VIOLET }}>optimización de caja negra</strong>.
        </p>
      </div>
    </SlideLayout>
  );
}

// ============================================================
// FlowDiagram — audio target → [???] → FM synth → audio out
// ============================================================
function FlowDiagram() {
  return (
    <svg viewBox="0 0 1080 110" width="100%" style={{ maxWidth: 1080, margin: '0 auto', display: 'block' }}>
      <Block x={20}  y={25} w={200} h={60} color={INK}    label="Audio objetivo" sub="x_target(t)" />
      <Block x={290} y={25} w={150} h={60} color={AMBER}  label="[ ??? ]"        sub="optimizador" dashed />
      <Block x={510} y={25} w={220} h={60} color={VIOLET} label="Sintetizador FM" sub="θ = (fc, ratio, I, …)" />
      <Block x={800} y={25} w={260} h={60} color={BLUE}   label="Audio sintetizado" sub="x_synth(t) ≈ x_target(t)" />

      <Arrow x1={220} x2={290} y={55} />
      <Arrow x1={440} x2={510} y={55} />
      <Arrow x1={730} x2={800} y={55} />
    </svg>
  );
}

function Block({ x, y, w, h, color, label, sub, dashed = false }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill={dashed ? 'transparent' : `${color}14`}
        stroke={color} strokeWidth={1.6}
        strokeDasharray={dashed ? '6 4' : undefined} />
      <text x={x + w / 2} y={y + 26} textAnchor="middle"
        fontFamily="'Newsreader', serif" fontSize={16} fontWeight={500} fill={color}>
        {label}
      </text>
      <text x={x + w / 2} y={y + 45} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={10.5} fill={INK_MUTED}>
        {sub}
      </text>
    </g>
  );
}

function Arrow({ x1, x2, y }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 8} y2={y} stroke={INK} strokeWidth={1.4} />
      <polygon points={`${x2 - 8},${y - 5} ${x2},${y} ${x2 - 8},${y + 5}`} fill={INK} />
    </g>
  );
}

function BulletCard({ kicker, color, title, body }) {
  return (
    <div style={{
      borderLeft: `3px solid ${color}`, padding: '10px 16px',
      background: 'rgba(255,255,255,0.55)', borderRadius: 4,
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
        textTransform: 'uppercase', color, fontWeight: 700,
      }}>{kicker}</span>
      <div style={{
        fontFamily: "'Newsreader', serif", fontSize: 16.5, color: INK,
        fontWeight: 600, margin: '3px 0 3px',
      }}>{title}</div>
      <div style={{
        fontFamily: "'Newsreader', serif", fontSize: 14, color: INK_MUTED,
        lineHeight: 1.45,
      }}>{body}</div>
    </div>
  );
}

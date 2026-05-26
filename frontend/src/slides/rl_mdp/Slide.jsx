/**
 * Slide 03 — Modelando el MDP para Sound Matching.
 *
 * Tabla comparativa (3 métodos) + texto introductorio MDP + diagrama cíclico
 * con zonas "Inteligencia Artificial" / "Acústica · Entorno" + 3 bullets con
 * las variables del sistema (S, A, R) y la fórmula de recompensa exacta.
 */

import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';

const BLUE   = '#2563eb';
const AMBER  = '#d97706';
const VIOLET = '#7c3aed';
const GREEN  = '#16a34a';
const INK       = '#1a1a2e';
const INK_MUTED = '#6b6b8a';
const INK_FAINT = '#9e9eb8';

const METHODS = [
  {
    method: 'Algoritmos evolutivos (CMA-ES)',
    limit:  'Comienza desde cero ante cada nuevo sonido objetivo',
    active: false,
  },
  {
    method: 'Deep Learning supervisado (InverSynth)',
    limit:  'Requiere miles de pares (audio, parámetros) etiquetados',
    active: false,
  },
  {
    method: 'RL — este proyecto',
    limit:  'Solo necesita una métrica de similitud acústica',
    active: true,
  },
];

export default function SlideRLMDP() {
  return (
    <SlideLayout
      sectionId="03"
      sectionLabel="Reinforcement learning · MDP"
      title={<>Modelando el <em style={{ color: VIOLET }}>MDP</em> para Sound Matching.</>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── Tabla comparativa ─────────────────────────────────── */}
        <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: 0,
            border: `1px solid ${INK_FAINT}55`, borderRadius: 8, overflow: 'hidden',
          }}>
            <HeaderCell text="Método" />
            <HeaderCell text="Limitación principal" />
            {METHODS.map((m, i) => (
              <RowFragment key={m.method} method={m} last={i === METHODS.length - 1} />
            ))}
          </div>
        </div>

        {/* ── Texto introductorio del MDP ───────────────────────── */}
        <div style={{
          maxWidth: 1080, margin: '0 auto', width: '100%',
          padding: '5px 14px',
          borderLeft: `3px solid ${INK_FAINT}`,
          fontFamily: "'Newsreader', serif", fontSize: 14.5, color: INK_MUTED,
          lineHeight: 1.5,
        }}>
          Un Proceso de Decisión de Markov (MDP) se define por la tupla{' '}
          <MathFormula t="(S, A, P, R)" />.{' '}
          Nuestro modelo carece de inercia física: cada acción genera un sonido nuevo desde cero.
        </div>

        {/* ── Diagrama MDP + bullets de variables ───────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24,
          alignItems: 'start',
          maxWidth: 1080, margin: '0 auto', width: '100%',
        }}>
          <MDPDiagram />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 4 }}>
            <MDPBullet
              kicker="ESTADO"
              color={BLUE}
              math="S_t \in \mathbb{R}^{54}"
              body={
                <>
                  Lo que el agente «escucha». Une{' '}
                  <strong>27 descriptores</strong> del audio actual y 27 del
                  Target (13 MFCC Mean + 13 MFCC Std + 1 Spectral Centroid).
                </>
              }
            />
            <MDPBullet
              kicker="ACCIÓN"
              color={AMBER}
              math="A_t \in [-1,1]^8"
              body={
                <>
                  Controles del sintetizador normalizados (
                  <MathFormula t="f_c" />, ratio,{' '}
                  <MathFormula t="I" />, feedback y envolvente ADSR).
                </>
              }
            />
            <MDPBullet
              kicker="RECOMPENSA"
              color={GREEN}
              math="R_t"
              body={
                <>
                  <span>Métrica de similitud acústica basada en STFT.</span>
                  <div style={{ marginTop: 6, textAlign: 'center' }}>
                    <MathFormula
                      t="r = \exp\!\left(-2.0 \cdot \left[0.4 \cdot d_{\text{spec}} + 0.4 \cdot d_{\text{mfcc}} + 0.2 \cdot d_{\text{sc}}\right]\right)"
                      display
                    />
                  </div>
                </>
              }
            />
          </div>
        </div>

      </div>
    </SlideLayout>
  );
}

// ── Tabla helpers ─────────────────────────────────────────────────────────────

function HeaderCell({ text }) {
  return (
    <div style={{
      padding: '9px 16px', background: '#f1efe7',
      fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700,
      borderBottom: `1px solid ${INK_FAINT}55`,
    }}>{text}</div>
  );
}

function RowFragment({ method, last }) {
  const bg     = method.active ? '#f5f0fb' : 'transparent';
  const weight = method.active ? 700 : 400;
  const border = last ? 'none' : `1px solid ${INK_FAINT}33`;
  return (
    <>
      <div style={{
        padding: '11px 16px', background: bg,
        fontFamily: "'Newsreader', serif", fontSize: 15.5,
        color: method.active ? VIOLET : INK,
        fontWeight: weight, borderBottom: border,
      }}>{method.method}</div>
      <div style={{
        padding: '11px 16px', background: bg,
        fontFamily: "'Newsreader', serif", fontSize: 15,
        color: method.active ? INK : INK_MUTED,
        fontWeight: weight, borderBottom: border,
      }}>{method.limit}</div>
    </>
  );
}

// ── MDP cycle diagram — two world zones ──────────────────────────────────────
//
// Layout (W=540, H=330):
//   Agente SAC       (top-left,    30,30,  210×64)  ← ZONA: IA
//   Sintetizador FM  (top-right,   300,30, 210×64)  ┐
//   Audio Objetivo   (mid-right,   300,140,210×48)  │ ZONA: ACÚSTICA · ENTORNO
//   Extractor MIR    (bot-right,   300,232,210×64)  │ (L-shape: right col + bot-left)
//   Recompensa       (bot-left,    30,232, 210×64)  ┘
//
// Zone L-shape path covers right column (x≥282) AND bottom strip (y≥222).

function MDPDiagram() {
  const W = 540, H = 330;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 540 }}>

      {/* ── Zone backgrounds (behind nodes) ─────────────────────── */}

      {/*
       * ACÚSTICA · ENTORNO — L-shape:
       *   Top portion  : x=282→530, y=8→322  (right column)
       *   Bottom strip : x=18→282,  y=222→322 (Recompensa area)
       * Path clockwise from top-left of right section:
       *   M282,8 → H530 → V322 → H18 → V222 → H282 → Z
       */}
      <path
        d="M282,8 H530 V322 H18 V222 H282 Z"
        fill={`${BLUE}07`}
        stroke={INK_FAINT}
        strokeWidth={0.9}
        strokeOpacity={0.5}
        strokeDasharray="5 3"
      />
      <text x={405} y={22} textAnchor="middle"
        fontFamily="'Inter', sans-serif" fontSize={8.5} letterSpacing="0.18em"
        fill={INK_FAINT} fontWeight={700}>ACÚSTICA · ENTORNO</text>

      {/* INTELIGENCIA ARTIFICIAL — rect around Agente SAC only */}
      <rect x={18} y={8} width={240} height={96} rx={8}
        fill={`${VIOLET}09`}
        stroke={VIOLET}
        strokeWidth={0.9}
        strokeOpacity={0.35}
        strokeDasharray="5 3"
      />
      <text x={138} y={22} textAnchor="middle"
        fontFamily="'Inter', sans-serif" fontSize={8.5} letterSpacing="0.18em"
        fill={VIOLET} fontWeight={700} fillOpacity={0.65}>INTELIGENCIA ARTIFICIAL</text>

      {/* ── Nodes ────────────────────────────────────────────────── */}
      <Node x={30}  y={30}  w={210} h={64} color={VIOLET} title="Agente SAC"      sub="π_φ(a | s)" />
      <Node x={300} y={30}  w={210} h={64} color={AMBER}  title="Sintetizador FM"  sub="θ → audio synth" />
      <Node x={300} y={232} w={210} h={64} color={BLUE}   title="Extractor MIR"   sub="STFT · MFCC · …" />
      <Node x={30}  y={232} w={210} h={64} color={GREEN}  title="Recompensa"       sub="r = f_sim( ·, target )" />

      {/* Audio objetivo (lateral, dashed) */}
      <rect x={300} y={140} width={210} height={48} rx={6}
        fill="transparent" stroke={INK_FAINT} strokeWidth={1.1} strokeDasharray="5 4" />
      <text x={405} y={162} textAnchor="middle"
        fontFamily="'Inter', sans-serif" fontSize={11} letterSpacing="0.16em"
        fill={INK_MUTED} fontWeight={700}>AUDIO OBJETIVO</text>
      <text x={405} y={177} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={10} fill={INK_MUTED}>x_target(t)</text>

      {/* ── Arrows ───────────────────────────────────────────────── */}
      {/* Agente SAC → Sintetizador FM */}
      <CycleArrow x1={240} y1={62}  x2={300} y2={62}  label="θ" />
      {/* Sintetizador FM ↓ Audio Objetivo */}
      <CycleArrow x1={405} y1={94}  x2={405} y2={140} />
      {/* Audio Objetivo ↓ Extractor MIR */}
      <CycleArrow x1={405} y1={188} x2={405} y2={232} />
      {/* Extractor MIR → Recompensa */}
      <CycleArrow x1={300} y1={264} x2={240} y2={264} label="r" />
      {/* Recompensa ↑ Agente SAC  (s_t) */}
      <CycleArrow x1={135} y1={232} x2={135} y2={94}  label="s_t" />
    </svg>
  );
}

function Node({ x, y, w, h, color, title, sub }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill={`${color}14`} stroke={color} strokeWidth={1.6} />
      <text x={x + w / 2} y={y + h * 0.44} textAnchor="middle"
        fontFamily="'Newsreader', serif" fontSize={15.5} fontWeight={600} fill={color}>
        {title}
      </text>
      <text x={x + w / 2} y={y + h * 0.74} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={10.5} fill={INK_MUTED}>
        {sub}
      </text>
    </g>
  );
}

function CycleArrow({ x1, y1, x2, y2, label }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const tipX = x2 - ux * 4, tipY = y2 - uy * 4;
  const px = -uy * 5, py = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={tipX} y2={tipY} stroke={INK} strokeWidth={1.4} />
      <polygon
        points={`${tipX - ux*8 + px},${tipY - uy*8 + py} ${tipX},${tipY} ${tipX - ux*8 - px},${tipY - uy*8 - py}`}
        fill={INK}
      />
      {label && (
        <text
          x={(x1 + x2) / 2 + (Math.abs(dy) > Math.abs(dx) ? 12 : 0)}
          y={(y1 + y2) / 2 + (Math.abs(dx) > Math.abs(dy) ? -6 : 4)}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace" fontSize={11} fill={AMBER} fontWeight={700}
        >{label}</text>
      )}
    </g>
  );
}

// ── MDP variable bullets ──────────────────────────────────────────────────────

function MDPBullet({ kicker, color, math, body }) {
  return (
    <div style={{
      borderLeft: `3px solid ${color}`, padding: '7px 13px',
      background: 'rgba(255,255,255,0.55)', borderRadius: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
          textTransform: 'uppercase', color, fontWeight: 700,
        }}>{kicker}</span>
        <span style={{ fontSize: 14 }}>
          <MathFormula t={math} />
        </span>
      </div>
      <div style={{
        fontFamily: "'Newsreader', serif", fontSize: 14, color: INK_MUTED,
        lineHeight: 1.45, marginTop: 3,
      }}>{body}</div>
    </div>
  );
}

/**
 * Slide 01 — Portada y el Problema (Yamaha DX7).
 *
 * Dos sub-pasos internos (revelados por SubStepTabs):
 *   1. Portada: 1967 · Stanford · Chowning.
 *   2. El problema: cómo el DX7 sonaba "infinito" con 6 osciladores.
 *
 * IMPORTANTE: La navegación entre slides la maneja App.jsx (footer global).
 * Este componente sólo gestiona su `step` interno mediante SubStepTabs.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import {
  AMBER, BLUE, RED, VIOLET, INK, INK_MUTED, INK_FAINT, CREAM,
  SubStepTabs,
} from './_shared.jsx';

const SUB_ITEMS = [
  { label: 'Portada · Stanford 1967', color: AMBER },
  { label: 'Revelar el problema · DX7 1983', color: BLUE },
];

export default function SlidePortada() {
  const [sub, setSub] = useState(0);

  return (
    <SlideLayout
      sectionId="01"
      sectionLabel="Síntesis FM · Portada y problema"
      title="Síntesis por Modulación de Frecuencia (FM)."
      subtitle="Modelado tímbrico complejo mediante osciladores acoplados."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SubStepTabs items={SUB_ITEMS} value={sub} onChange={setSub} />
        {sub === 0 ? <PortadaPanel /> : <ProblemaDX7Panel />}
      </div>
    </SlideLayout>
  );
}

// ============================================================
// Sub-paso 1 · Portada
// ============================================================
function PortadaPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, minHeight: 420, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
          Mecanismo de Generación
        </span>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 38, lineHeight: 1.1, color: INK, margin: 0, fontWeight: 500 }}>
          Modulación de frecuencia<br />
          <em style={{ color: AMBER }}>en el rango de audio</em>.
        </h3>
        <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, color: INK_MUTED, lineHeight: 1.5, margin: 0 }}>
          La síntesis FM genera timbres complejos modulando la frecuencia de una señal
          portadora con otra de audio. Este proceso no lineal crea bandas laterales
          cuya distribución define la identidad tímbrica del sonido resultante.
        </p>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: INK_FAINT, marginTop: 8 }}>
          <span style={{ color: BLUE }}>● f_c</span>
          <span style={{ marginLeft: 18, color: RED }}>● f_m</span>
          <span style={{ marginLeft: 18, color: AMBER }}>● I</span>
        </div>
      </div>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 320 320" width="100%" style={{ maxWidth: 380 }}>
          <defs>
            <radialGradient id="halo" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={AMBER} stopOpacity={0.35} />
              <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={160} cy={160} r={120} fill="url(#halo)" />
          <circle cx={160} cy={160} r={70} fill="none" stroke={BLUE} strokeWidth={3} />
          <text x={160} y={92} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={14} fill={BLUE}>f_c</text>
          <circle cx={250} cy={160} r={28} fill="none" stroke={RED} strokeWidth={3} />
          <text x={250} y={158} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={12} fill={RED}>f_m</text>
          {[1, 2, 3, 4].map((n) => (
            <circle key={n} cx={160} cy={160} r={70 + n * 14} fill="none"
              stroke={AMBER} strokeWidth={1} strokeOpacity={0.6 - n * 0.12} strokeDasharray="2 4" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ============================================================
// Sub-paso 2 · El problema del DX7
// ============================================================
function AdditiveChaosSchematic() {
  const W = 320, H = 320, oscs = 22, top = 42;
  const rowH = (H - top - 36) / oscs;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 360 }}>
      <text x={W / 2} y={16} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={11} letterSpacing={2.4} fill={RED} fontWeight={700}>
        SÍNTESIS ADITIVA · FOURIER
      </text>
      <text x={W / 2} y={30} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={9.5} fill={INK_MUTED}>
        un oscilador + ADSR por cada armónico
      </text>
      {Array.from({ length: oscs }).map((_, i) => {
        const y = top + i * rowH + rowH / 2;
        return (
          <g key={i}>
            <rect x={14} y={y - rowH / 2 + 1} width={56} height={rowH - 2} fill={RED} fillOpacity={0.16} stroke={RED} strokeWidth={0.6} rx={2} />
            <text x={42} y={y + 2.5} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={6.4} fill={INK}>OSC {i + 1}</text>
            <line x1={70} y1={y} x2={104} y2={y} stroke={RED} strokeOpacity={0.5} strokeWidth={0.6} />
            <rect x={104} y={y - rowH / 2 + 1} width={70} height={rowH - 2} fill={AMBER} fillOpacity={0.14} stroke={AMBER} strokeWidth={0.6} rx={2} />
            <text x={139} y={y + 2.5} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={6.4} fill={INK}>ADSR {i + 1}</text>
            <line x1={174} y1={y} x2={236} y2={y} stroke={AMBER} strokeOpacity={0.45} strokeWidth={0.6} />
          </g>
        );
      })}
      <line x1={236} y1={top + 4} x2={236} y2={H - 40} stroke={INK} strokeWidth={1.2} />
      <line x1={236} y1={(top + H - 36) / 2} x2={284} y2={(top + H - 36) / 2} stroke={INK} strokeWidth={1.4} />
      <polygon points={`284,${(top + H - 36) / 2 - 5} 296,${(top + H - 36) / 2} 284,${(top + H - 36) / 2 + 5}`} fill={INK} />
      <text x={266} y={(top + H - 36) / 2 - 8} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={9} fill={INK}>Σ</text>
      <text x={W / 2} y={H - 14} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={10} fill={RED} fontStyle="italic">
        prohibitivo en hardware de 1983
      </text>
    </svg>
  );
}

function YamahaDX7Illustration() {
  return (
    <svg viewBox="0 0 360 220" width="100%" style={{ maxWidth: 360 }}>
      <defs>
        <linearGradient id="dx7body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b3b50" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
        <linearGradient id="lcd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f3a1f" />
          <stop offset="100%" stopColor="#1d5a32" />
        </linearGradient>
      </defs>
      <ellipse cx={180} cy={210} rx={140} ry={6} fill={INK} opacity={0.18} />
      <rect x={14} y={18} width={332} height={132} rx={6} fill="url(#dx7body)" stroke="#0a0a18" strokeWidth={1.5} />
      <rect x={14} y={18} width={332} height={26} rx={6} fill="#0d0d1c" />
      <text x={28} y={37} fontFamily="JetBrains Mono,monospace" fontSize={12} fill={AMBER} fontWeight={700} letterSpacing={1.5}>YAMAHA</text>
      <text x={108} y={37} fontFamily="JetBrains Mono,monospace" fontSize={10} fill={CREAM} letterSpacing={2}>
        DX7  ·  DIGITAL FM SYNTHESIZER  ·  1983
      </text>
      <rect x={28} y={56} width={104} height={28} rx={2} fill="url(#lcd)" stroke="#16a34a" strokeWidth={0.8} />
      <text x={36} y={75} fontFamily="JetBrains Mono,monospace" fontSize={11} fill="#7af0a0" letterSpacing={1.2}>E.PIANO 1</text>
      {Array.from({ length: 32 }).map((_, i) => {
        const col = i % 8, row = Math.floor(i / 8);
        return (
          <rect key={i} x={146 + col * 23} y={54 + row * 18} width={18} height={12} rx={1.5}
            fill="#2c2c44" stroke="#5a5a72" strokeWidth={0.5} />
        );
      })}
      <rect x={14} y={150} width={332} height={48} fill="#fafafa" stroke="#0a0a18" strokeWidth={1} />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1={14 + i * 13.83} y1={150} x2={14 + i * 13.83} y2={198} stroke={INK_FAINT} strokeWidth={0.5} />
      ))}
      {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19].map((octBase) =>
        [1, 3, 6, 8, 10].map((n) => {
          const k = octBase + n;
          if (k >= 24) return null;
          return <rect key={`${octBase}-${n}`} x={14 + k * 13.83 - 3.8} y={150} width={7.6} height={28} fill="#0a0a18" />;
        })
      )}
      <text x={180} y={216} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED} fontStyle="italic">
        Yamaha DX7 — 6 operadores · 32 algoritmos · 16 voces de polifonía
      </text>
    </svg>
  );
}

function DX7CleanSchematic() {
  const W = 320, H = 320, opR = 26;
  const ops = [
    { n: 6, x: 60, y: 70, kind: 'mod' }, { n: 5, x: 160, y: 70, kind: 'mod' }, { n: 4, x: 260, y: 70, kind: 'mod' },
    { n: 3, x: 110, y: 160, kind: 'mod' }, { n: 2, x: 90, y: 240, kind: 'carrier' }, { n: 1, x: 230, y: 240, kind: 'carrier' },
  ];
  const links = [[6, 3], [5, 3], [4, 3], [3, 2]];
  const byN = Object.fromEntries(ops.map((o) => [o.n, o]));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 360 }}>
      <text x={W / 2} y={16} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={11} letterSpacing={2.4} fill={BLUE} fontWeight={700}>
        DX7 · 6 OPERADORES
      </text>
      <text x={W / 2} y={30} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={9.5} fill={INK_MUTED}>
        cada operador = 1 senoide + 1 envolvente
      </text>
      {links.map(([from, to], i) => {
        const a = byN[from], b = byN[to];
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y + opR} x2={b.x} y2={b.y - opR} stroke={INK} strokeWidth={1} opacity={0.55} />
            <polygon points={`${b.x - 4},${b.y - opR - 8} ${b.x + 4},${b.y - opR - 8} ${b.x},${b.y - opR}`} fill={INK} opacity={0.7} />
          </g>
        );
      })}
      {ops.map((o) => (
        <g key={o.n}>
          <circle cx={o.x} cy={o.y} r={opR} fill={o.kind === 'carrier' ? BLUE : AMBER} fillOpacity={0.18}
            stroke={o.kind === 'carrier' ? BLUE : AMBER} strokeWidth={1.6} />
          <text x={o.x} y={o.y - 3} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={12} fill={INK} fontWeight={700}>OP{o.n}</text>
          <text x={o.x} y={o.y + 11} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={8.5} fill={INK_MUTED}>{o.kind}</text>
        </g>
      ))}
      <line x1={byN[2].x} y1={byN[2].y + opR + 2} x2={W / 2} y2={H - 30} stroke={BLUE} strokeWidth={1.2} opacity={0.7} />
      <line x1={byN[1].x} y1={byN[1].y + opR + 2} x2={W / 2} y2={H - 30} stroke={BLUE} strokeWidth={1.2} opacity={0.7} />
      <text x={W / 2} y={H - 14} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={10} fill={BLUE} fontStyle="italic">
        profundidad &gt; cantidad — interacción no lineal
      </text>
    </svg>
  );
}

function ProblemaDX7Panel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 420 }}>
      <div style={{ textAlign: 'center', maxWidth: 920, margin: '0 auto' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
          El límite de la Síntesis Aditiva
        </span>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, lineHeight: 1.22, color: INK, margin: '6px 0 0', fontWeight: 500 }}>
          Emular instrumentos reales sumando sinusoides individuales <br />
          exige una <em style={{ color: RED }}>enorme carga computacional</em>.
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr 1fr', gap: 18, alignItems: 'center' }}>
        <AdditiveChaosSchematic />
        <YamahaDX7Illustration />
        <DX7CleanSchematic />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 4, maxWidth: 920, margin: '4px auto 0', width: '100%' }}>
        {[
          { song: 'E. PIANO 1', desc: 'el preset de las baladas pop', color: AMBER },
          { song: 'When Doves Cry', desc: 'Prince — bajo percusivo digital', color: VIOLET },
          { song: 'Tubular Bells', desc: 'Mike Oldfield — campanas FM', color: BLUE },
        ].map((ex) => (
          <div key={ex.song} style={{
            borderLeft: `3px solid ${ex.color}`, padding: '8px 12px',
            background: 'rgba(255,255,255,0.5)', borderRadius: 4,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: ex.color, fontWeight: 700 }}>
              {ex.song}
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: INK_MUTED, marginTop: 2, fontStyle: 'italic' }}>
              {ex.desc}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK_MUTED, lineHeight: 1.5, textAlign: 'center', margin: '4px auto 0', maxWidth: 820 }}>
        <strong>El Paradigma DX7:</strong> En 1983, el Yamaha DX7 definió una década logrando espectros
        inmensamente ricos utilizando únicamente <strong>6 osciladores interactivos</strong>.
        ¿Cómo se genera tal complejidad espectral con tan pocos recursos computacionales?
      </p>
    </div>
  );
}


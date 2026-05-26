/**
 * Slide 06 — Conclusiones y Próximos Pasos.
 *
 * Dos columnas: logros + hoja de ruta. Frase de cierre.
 */

import SlideLayout from '../../components/SlideLayout';

const BLUE = '#2563eb';
const RED = '#c0392b';
const AMBER = '#d97706';
const VIOLET = '#7c3aed';
const GREEN = '#16a34a';
const INK = '#1a1a2e';
const INK_MUTED = '#6b6b8a';
const INK_FAINT = '#9e9eb8';

const ACHIEVEMENTS = [
  { text: <>Pipeline completo funcional <strong>end-to-end</strong> en CPU</>, color: GREEN },
  { text: <>El agente <strong>converge correctamente en pitch</strong> (f_c)</>, color: GREEN },
  { text: <>La recompensa STFT+MFCC genera <strong>mínimos locales explotables</strong></>, color: AMBER },
  { text: <>Métricas espectrales globales: <em>condición necesaria pero no suficiente</em></>, color: AMBER },
];

const ROADMAP = [
  { stage: 'Inmediato',   action: 'Agregar F0 vía pyin en recompensa', goal: 'Romper la degeneración del ratio', color: AMBER },
  { stage: 'Corto plazo', action: 'Randomizar target en cada episodio', goal: 'Política generalizable in-domain', color: BLUE },
  { stage: 'Futuro',      action: 'Sonidos reales (dataset NSynth)',    goal: 'Generalización out-of-domain',    color: VIOLET },
];

export default function SlideConclusiones() {
  return (
    <SlideLayout
      sectionId="06"
      sectionLabel="Conclusiones · próximos pasos"
      title={<>Qué se logró y hacia dónde <em style={{ color: VIOLET }}>va el proyecto</em>.</>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{
          display: 'grid', gridTemplateColumns: '0.95fr 1.15fr', gap: 24,
          maxWidth: 1100, margin: '0 auto', width: '100%',
        }}>

          {/* Columna izquierda: lo que se demostró */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: 4,
            }}>Lo que se demostró</div>
            {ACHIEVEMENTS.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 14px', borderLeft: `3px solid ${a.color}`,
                background: 'rgba(255,255,255,0.5)', borderRadius: 4,
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: a.color,
                  fontWeight: 700, lineHeight: 1.4, paddingTop: 2,
                }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{
                  fontFamily: "'Newsreader', serif", fontSize: 14.5, color: INK,
                  lineHeight: 1.5,
                }}>{a.text}</div>
              </div>
            ))}
          </div>

          {/* Columna derecha: roadmap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: VIOLET, fontWeight: 700, marginBottom: 4,
            }}>Hoja de ruta</div>
            <div style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 0,
              border: `1px solid ${INK_FAINT}55`, borderRadius: 8, overflow: 'hidden',
            }}>
              {['Paso', 'Acción', 'Objetivo'].map((h) => (
                <div key={h} style={{
                  padding: '9px 14px', background: '#f1efe7',
                  fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700,
                  borderBottom: `1px solid ${INK_FAINT}55`,
                }}>{h}</div>
              ))}
              {ROADMAP.map((r, i) => (
                <RoadmapRow key={r.stage} {...r} last={i === ROADMAP.length - 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Frase de cierre */}
        <div style={{
          marginTop: 6, padding: '16px 22px', borderRadius: 10,
          background: 'linear-gradient(95deg, #f5f0fb 0%, #fffaf0 100%)',
          border: `1px solid ${VIOLET}33`,
          maxWidth: 940, margin: '6px auto 0', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Newsreader', serif", fontSize: 19, color: INK,
            lineHeight: 1.45, margin: 0,
          }}>
            <em style={{ color: VIOLET }}>El agente actual valida el pipeline.</em>{' '}
            El siguiente paso no requiere cambiar la arquitectura —{' '}
            solo <strong style={{ color: AMBER }}>enriquecer lo que el agente puede escuchar</strong>.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}

function RoadmapRow({ stage, action, goal, color, last }) {
  const border = last ? 'none' : `1px solid ${INK_FAINT}33`;
  return (
    <>
      <div style={{
        padding: '11px 14px', borderBottom: border, borderLeft: `4px solid ${color}`,
        fontFamily: "'Inter', sans-serif", fontSize: 11.5, letterSpacing: '0.1em',
        textTransform: 'uppercase', color, fontWeight: 700,
        display: 'flex', alignItems: 'center',
      }}>{stage}</div>
      <div style={{
        padding: '11px 14px', borderBottom: border,
        fontFamily: "'Newsreader', serif", fontSize: 14, color: INK,
        display: 'flex', alignItems: 'center',
      }}>{action}</div>
      <div style={{
        padding: '11px 14px', borderBottom: border,
        fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK_MUTED,
        fontStyle: 'italic',
        display: 'flex', alignItems: 'center',
      }}>{goal}</div>
    </>
  );
}

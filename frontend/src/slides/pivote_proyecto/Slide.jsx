/**
 * Slide 01 — Pivote del Proyecto
 * De Transfer de Timbre Neuronal a Sound Matching Paramétrico.
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

const ROWS = [
  { eje: 'Tecnología base', old: 'RAVE / DDSP (modelos neuronales)', neu: 'Síntesis FM clásica (Chowning, 1973)' },
  { eje: 'Interpretabilidad', old: 'Parámetros latentes sin sentido musical', neu: 'Parámetros con significado físico directo' },
  { eje: 'Cómputo requerido', old: 'GPU dedicada (CUDA)', neu: 'CPU only — Intel Core i7' },
  { eje: 'Foco metodológico', old: 'Generación neuronal end-to-end', neu: 'DSP + MIR — núcleo del curso' },
];

export default function SlidePivoteProyecto() {
  return (
    <SlideLayout
      sectionId="01"
      sectionLabel="Hito 2 · Pivote del proyecto"
      title={<>De <em style={{ color: RED }}>Transfer de Timbre Neuronal</em> a <em style={{ color: VIOLET }}>Sound Matching Paramétrico</em>.</>}
      subtitle="El cambio no fue retroceso: fue elegir interpretabilidad sobre complejidad computacional."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Cabecera de columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 16, alignItems: 'end' }}>
          <div />
          <ColumnHeader
            kicker="Propuesta original"
            label="Descartada"
            color={RED}
            strike
          />
          <ColumnHeader
            kicker="Propuesta actual"
            label="Hito 2"
            color={VIOLET}
          />
        </div>

        {/* Filas comparativas */}
        {ROWS.map((row, i) => (
          <div key={row.eje} style={{
            display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 16, alignItems: 'stretch',
            borderTop: i === 0 ? `1px solid ${INK_FAINT}55` : 'none',
            paddingTop: i === 0 ? 4 : 0,
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11.5, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700,
              display: 'flex', alignItems: 'center',
            }}>
              {row.eje}
            </div>
            <Cell text={row.old} color={RED} muted />
            <Cell text={row.neu} color={GREEN} />
          </div>
        ))}

        {/* Nota expositor */}
        <div style={{
          marginTop: 10, padding: '14px 20px', borderLeft: `3px solid ${AMBER}`,
          background: '#fffaf0', borderRadius: 4, maxWidth: 920,
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: AMBER, fontWeight: 700,
          }}>Nota para el expositor</span>
          <p style={{
            fontFamily: "'Newsreader', serif", fontSize: 16, color: INK, lineHeight: 1.5,
            margin: '4px 0 0',
          }}>
            El cambio no fue un retroceso. Fue elegir <strong style={{ color: VIOLET }}>interpretabilidad</strong> y
            alineación con el curso sobre <strong style={{ color: RED }}>complejidad computacional</strong>.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}

function ColumnHeader({ kicker, label, color, strike = false }) {
  return (
    <div style={{
      borderTop: `3px solid ${color}`, paddingTop: 8,
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700,
      }}>
        {kicker}
      </span>
      <span style={{
        fontFamily: "'Newsreader', serif", fontSize: 22, color, fontWeight: 600,
        textDecoration: strike ? 'line-through' : 'none',
        textDecorationColor: strike ? `${color}88` : undefined,
      }}>
        {label}
      </span>
    </div>
  );
}

function Cell({ text, color, muted = false }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 6,
      border: `1px solid ${color}${muted ? '33' : '55'}`,
      background: muted ? '#faf6f4' : '#f5fbf6',
      fontFamily: "'Newsreader', serif", fontSize: 15.5, lineHeight: 1.45,
      color: muted ? INK_MUTED : INK,
      textDecoration: muted ? 'line-through' : 'none',
      textDecorationColor: muted ? `${color}55` : undefined,
      display: 'flex', alignItems: 'center',
    }}>
      {text}
    </div>
  );
}

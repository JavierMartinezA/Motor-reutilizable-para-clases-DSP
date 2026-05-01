/**
 * SlideTemplate.jsx
 * =================
 * Plantilla de referencia (FEW-SHOT) extraída de la topología del slide
 * pedagógico-pipeline original. Sirve como prompt estructural para futuros
 * dominios.
 *
 * Patrón:
 *   1) Header con número/sección + título serif (con <em> para énfasis).
 *   2) Cuerpo en dos columnas: izquierda = controles + steps verticales;
 *      derecha = panel visual (imagen, canvas 3D, SVG).
 *   3) Footer con botón único de avance (state `step`, controlado por humano).
 *   4) Animación de entrada `anim-fade-up` en header y body con delay-2.
 *   5) Cards con estados: pending (gris fantasma) / revealed (color suave) /
 *      active (color pleno + descripción visible).
 *   6) Audio opcional vía new Audio(src) + ref; nunca importar WAV.
 *
 * Reemplazar todos los placeholders {{...}}.
 */

import { useState, useEffect, useRef } from 'react';
import SlideLayout from '../../components/SlideLayout';

// ── 1) Datos del slide (datos antes que JSX) ──────────────────────────────
const STEPS = [
  {
    step: 1,
    num: '1',
    title: '{{TÍTULO_PASO_1}}',
    sub: '{{SUBTÍTULO_PASO_1}}',
    desc: '{{DESCRIPCIÓN_TÉCNICA_BREVE}}',
    color: '#2563eb',          // azul = determinista / componente principal
    bg: '#eff6ff',
    asset: '/imagenes/{{archivo_paso_1}}.png',
    caption: '{{CAPTION_PASO_1}}',
  },
  // ... un objeto por paso. Mantener `color` consistente con la fórmula KaTeX.
];

const BTN_LABELS = [
  'Paso 1: {{NOMBRE}}',
  'Paso 2: {{NOMBRE}}',
  // ... uno por paso, terminando en 'Reiniciar'
  'Reiniciar',
];

// ── 2) Subcomponentes locales ─────────────────────────────────────────────
function VisualPanel({ card }) {
  // Fade-out (260ms) → swap → fade-in. Acepta image, canvas3d o svg.
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(card);
  const tRef = useRef(null);
  useEffect(() => {
    if (!card) { setVisible(false); return; }
    if (!shown) { setShown(card); setVisible(true); return; }
    setVisible(false);
    tRef.current = setTimeout(() => { setShown(card); setVisible(true); }, 260);
    return () => clearTimeout(tRef.current);
  }, [card]);
  if (!shown) return <div className="visual-panel-empty">Presiona un paso</div>;
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity .35s' }}>
      <img src={shown.asset} alt={shown.caption} />
      <span style={{ color: shown.color }}>{shown.caption}</span>
    </div>
  );
}

// ── 3) Componente principal ──────────────────────────────────────────────
export default function SlideTemplate() {
  const [step, setStep] = useState(0);
  const audioRef = useRef(null);

  // Audio opcional: precargar y limpiar al desmontar.
  useEffect(() => {
    const a = new Audio('/audio/{{archivo_audio}}.wav');
    audioRef.current = a;
    return () => { a.pause(); a.src = ''; };
  }, []);

  const isLast = step === STEPS.length;
  const handleStep = () => setStep(s => (s === STEPS.length ? 0 : s + 1));
  const activeCard = step > 0 ? STEPS[step - 1] : null;

  return (
    <SlideLayout
      sectionId="0X"
      sectionLabel="{{SECCIÓN}}"
      title={<>De {{X}} al <em>{{Y}}</em></>}
    >
      <div style={{ display: 'flex', gap: 32 }}>
        {/* Columna izquierda: cards de pasos */}
        <div style={{ width: 310, flexShrink: 0 }}>
          {STEPS.map((card) => {
            const revealed = step >= card.step;
            const active   = step === card.step;
            return (
              <div key={card.num} style={{
                opacity: revealed ? 1 : 0.35,
                borderColor: active ? card.color : '#e0ddd4',
                background: active ? card.bg : '#faf9f7',
              }}>
                <strong style={{ color: card.color }}>{card.title}</strong>
                <em>{card.sub}</em>
                {active && <p>{card.desc}</p>}
              </div>
            );
          })}
        </div>

        {/* Columna derecha: panel visual */}
        <VisualPanel card={activeCard} />
      </div>

      {/* Footer: botón de avance manual (NO timers automáticos) */}
      <button onClick={handleStep} style={{
        background: isLast ? 'transparent' : (activeCard?.color ?? '#2563eb'),
        color: isLast ? '#9ca3af' : '#fff',
      }}>
        {BTN_LABELS[step]}
      </button>
    </SlideLayout>
  );
}

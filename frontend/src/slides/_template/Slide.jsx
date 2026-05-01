/**
 * Plantilla de Slide concreta.
 * ============================
 * Para crear una slide nueva:
 *   1. Copiar este directorio: cp -r _template <mi-id>
 *   2. Renombrar el componente y exportarlo en src/slides/index.js.
 *   3. Declarar la entrada en course_config.json.
 *
 * Para una versión más rica con dos columnas + pasos + audio, ver el
 * patrón few-shot completo en /_template/SlideTemplate.jsx (raíz repo).
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import AudioPlayer from '../../components/AudioPlayer';

export default function SlideTemplate({ audio, formula }) {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="00"
      sectionLabel="Sección"
      title={<>Título <em>en cursiva</em></>}
      subtitle="Subtítulo opcional"
      footer={
        <button
          onClick={() => setStep((s) => (s + 1) % 3)}
          style={{
            padding: '14px 36px',
            borderRadius: 50,
            border: '2.5px solid #2563eb',
            background: '#2563eb',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Siguiente paso ({step}/2)
        </button>
      }
    >
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          {audio && <AudioPlayer src={audio} label="Demo" />}
          {formula && (
            <div className="math-box" style={{ marginTop: 16 }}>
              <MathFormula t={formula} display />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p>Slot derecho: visualización (SVG, canvas 3D, imagen).</p>
        </div>
      </div>
    </SlideLayout>
  );
}

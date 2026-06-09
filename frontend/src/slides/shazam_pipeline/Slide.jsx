/**
 * Clase 11 · MIR & Shazam — Slide 12 · Pipeline Completo
 * Resumen del pipeline de 6 etapas de Shazam.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import { INK, INK_MUTED, BLUE, VIOLET, AMBER, GREEN, PillButton } from '../_mir_shared.jsx';

const STAGES = [
  { id: 'captura', label: '1. Captura', color: '#64748b', desc: 'Grabación de audio ruidoso desde el micrófono del celular.', img: 'pipeline_1.png' },
  { id: 'espectro', label: '2. Espectrograma', color: BLUE, desc: 'Transformada de Fourier a Corto Plazo (STFT).', img: 'pipeline_2.png' },
  { id: 'constelacion', label: '3. Constelación', color: VIOLET, desc: 'Filtro de picos de máxima energía (superviven al ruido aditivo).', img: 'pipeline_3.png' },
  { id: 'pares', label: '4. Zonas Objetivo', color: AMBER, desc: 'Selección de un ancla y sus puntos destino (Target Zone).', img: 'pipeline_4.png' },
  { id: 'hashing', label: '5. Creación del Hash', color: '#ea580c', desc: 'Generación de la tupla invariante combinatoria.', formula: 'H = [f_1, f_2, \\Delta t] \\rightarrow (\\text{ID}, t_1)', img: 'pipeline_5.png' },
  { id: 'db', label: '6. Índice Invertido', color: '#0d9488', desc: 'Recuperación de coincidencias en la base de datos en tiempo O(1).', img: 'pipeline_7.png' },
  { id: 'scoring', label: '7. Scoring Final', color: GREEN, desc: 'Alineamiento temporal de los offsets. El pico máximo de Dirac es el match absoluto.', formula: '\\text{score} = \\max |\\{i : \\delta t_i = k\\}|', img: 'pipeline_8.png' },
];

export default function SlideShazamPipeline() {
  const [step, setStep] = useState(0);
  
  const activeStage = STAGES[step];

  return (
    <SlideLayout
      sectionId="12"
      sectionLabel="MIR · Pipeline Completo"
      title={<>El algoritmo de <em>Shazam</em> completo</>}
      subtitle="Repaso de las 7 etapas desde el micrófono hasta el servidor (Wang, 2003)."
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <PillButton color={INK_MUTED} kind="outline" onClick={() => setStep(s => Math.max(0, s - 1))}>←</PillButton>
          <div style={{ display: 'flex', gap: 6, margin: '0 8px' }}>
            {STAGES.map((s, i) => (
              <div key={s.id} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === step ? s.color : i < step ? s.color + '66' : '#e0ddd4'
              }} />
            ))}
          </div>
          <PillButton color={activeStage.color} onClick={() => setStep(s => Math.min(STAGES.length - 1, s + 1))}>
             {step < STAGES.length - 1 ? `Siguiente: ${STAGES[step + 1].label.split('.')[1]}` : 'Finalizar'} →
          </PillButton>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '0.65fr 1fr', gap: 40, alignItems: 'center', minHeight: 400 }}>
        {/* LEFT: Vertical SVG Nodes */}
        <div style={{ position: 'relative', height: 400, display: 'flex', justifyContent: 'center' }}>
          <svg width="220" height="400" viewBox="0 0 220 400" style={{ overflow: 'visible' }}>
            {/* Connecting line */}
            <line x1="80" y1="30" x2="80" y2="330" stroke="#e0ddd4" strokeWidth="4" />
            
            {STAGES.map((s, i) => {
              const y = 30 + i * 50; // 50px gap for 7 elements
              const isActive = i === step;
              const isPast = i < step;
              const color = isActive || isPast ? s.color : '#e0ddd4';
              const r = isActive ? 12 : 9;
              return (
                <g key={s.id} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
                  {isActive && <circle cx="80" cy={y} r={r + 5} fill={color} opacity="0.15" />}
                  <circle cx="80" cy={y} r={r} fill={color} stroke="#faf8f3" strokeWidth="3" />
                  <text x="110" y={y + 5} fill={isActive ? INK : INK_MUTED} 
                        fontFamily="'Inter', sans-serif" fontSize={isActive ? 14 : 12.5} 
                        fontWeight={isActive ? 800 : 500}>
                    {s.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT: Active Panel */}
        <div style={{ 
            display: 'flex', flexDirection: 'column', gap: 16, 
            padding: 30, background: '#fbf9f5', borderRadius: 16,
            border: `2px solid ${activeStage.color}44`,
            borderTop: `6px solid ${activeStage.color}`,
            minHeight: 380
          }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: INK, margin: 0 }}>
            {activeStage.label}
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: INK_MUTED, lineHeight: 1.5, margin: 0 }}>
            {activeStage.desc}
          </p>
          
          {activeStage.formula && (
             <div style={{ background: '#08111d', borderRadius: 10, padding: '16px', color: '#e3d4ff', textAlign: 'center', marginTop: 10 }}>
               <MathFormula t={activeStage.formula} color="#e3d4ff" size={1.2} display />
             </div>
          )}
          
          {/* Image Visual based on stage */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', width: '100%', height: 280, borderRadius: 8, overflow: 'hidden' }}>
             <img 
               src={`/imagenes/${activeStage.img}`} 
               alt={activeStage.label}
               style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
             />
          </div>

        </div>
      </div>
    </SlideLayout>
  );
}

/**
 * Clase 11 · MIR & Shazam — Slide 12 · Pipeline Completo
 * Resumen del pipeline de 6 etapas de Shazam.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import { INK, INK_MUTED, BLUE, VIOLET, AMBER, GREEN, PillButton } from '../_mir_shared.jsx';

const STAGES = [
  { id: 'captura', label: '1. Captura', color: '#64748b', desc: 'Grabación de audio ruidoso desde el micrófono del celular.' },
  { id: 'espectro', label: '2. Espectrograma', color: BLUE, desc: 'Transformada de Fourier a Corto Plazo (STFT).' },
  { id: 'constelacion', label: '3. Constelación', color: VIOLET, desc: 'Filtro de picos de máxima energía (superviven al ruido).' },
  { id: 'hashing', label: '4. Hashing', color: AMBER, desc: 'Creación de tuplas combinatorias para invarianza temporal.', formula: 'H = [f_1, f_2, \\Delta t] \\rightarrow (\\text{ID}, t_1)' },
  { id: 'db', label: '5. Base de datos', color: '#1e40af', desc: 'Búsqueda O(1) en el índice invertido gigante.' },
  { id: 'scoring', label: '6. Scoring', color: GREEN, desc: 'Histograma de offsets temporales. El pico máximo es el match.', formula: '\\text{score} = \\max |\\{i : \\delta t_i = k\\}|' },
];

export default function SlideShazamPipeline() {
  const [step, setStep] = useState(0);
  
  const activeStage = STAGES[step];

  return (
    <SlideLayout
      sectionId="12"
      sectionLabel="MIR · Pipeline Completo"
      title={<>El algoritmo de <em>Shazam</em> completo</>}
      subtitle="Repaso de las 6 etapas desde el micrófono hasta el servidor (Wang, 2003)."
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
          <PillButton color={activeStage.color} onClick={() => setStep(s => Math.min(5, s + 1))}>
             {step < 5 ? `Siguiente: ${STAGES[step + 1].label.split('.')[1]}` : 'Finalizar'} →
          </PillButton>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '0.65fr 1fr', gap: 40, alignItems: 'center', minHeight: 400 }}>
        {/* LEFT: Vertical SVG Nodes */}
        <div style={{ position: 'relative', height: 360, display: 'flex', justifyContent: 'center' }}>
          <svg width="200" height="360" viewBox="0 0 200 360" style={{ overflow: 'visible' }}>
            {/* Connecting line */}
            <line x1="80" y1="30" x2="80" y2="330" stroke="#e0ddd4" strokeWidth="4" />
            
            {STAGES.map((s, i) => {
              const y = 30 + i * 60;
              const isActive = i === step;
              const isPast = i < step;
              const color = isActive || isPast ? s.color : '#e0ddd4';
              const r = isActive ? 14 : 10;
              return (
                <g key={s.id} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
                  {isActive && <circle cx="80" cy={y} r={r + 6} fill={color} opacity="0.15" />}
                  <circle cx="80" cy={y} r={r} fill={color} stroke="#faf8f3" strokeWidth="3" />
                  <text x="110" y={y + 5} fill={isActive ? INK : INK_MUTED} 
                        fontFamily="'Inter', sans-serif" fontSize={isActive ? 15 : 13} 
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
            minHeight: 280
          }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: INK, margin: 0 }}>
            {activeStage.label}
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: INK_MUTED, lineHeight: 1.5, margin: 0 }}>
            {activeStage.desc}
          </p>
          
          {activeStage.formula && (
             <div style={{ background: '#08111d', borderRadius: 10, padding: '20px 18px', color: '#e3d4ff', textAlign: 'center', marginTop: 10 }}>
               <MathFormula t={activeStage.formula} color="#e3d4ff" size={1.25} display />
             </div>
          )}
          
          {/* Inline SVG Visuals based on stage */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
            {step === 0 && (
               <svg width="120" height="60" viewBox="0 0 120 60">
                 <path d="M10,30 Q20,10 30,30 T50,30 T70,30 T90,30 T110,30" fill="none" stroke={activeStage.color} strokeWidth="3" />
                 <path d="M10,30 Q20,50 30,30 T50,30 T70,30" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.6" strokeDasharray="2 2" />
               </svg>
            )}
            {step === 1 && (
               <svg width="120" height="80" viewBox="0 0 120 80">
                 <rect x="10" y="10" width="100" height="60" fill="none" stroke={activeStage.color} strokeWidth="2" strokeDasharray="4 4" />
                 <path d="M20,60 L40,30 L60,50 L80,20 L100,40" fill="none" stroke={activeStage.color} strokeWidth="3" />
               </svg>
            )}
            {step === 2 && (
               <svg width="120" height="80" viewBox="0 0 120 80">
                 <rect x="10" y="10" width="100" height="60" fill="none" stroke={activeStage.color} strokeWidth="2" strokeDasharray="4 4" />
                 <circle cx="30" cy="50" r="4" fill={activeStage.color} />
                 <circle cx="60" cy="30" r="4" fill={activeStage.color} />
                 <circle cx="90" cy="40" r="4" fill={activeStage.color} />
                 <circle cx="45" cy="65" r="3" fill={activeStage.color} opacity="0.5" />
                 <circle cx="75" cy="15" r="3" fill={activeStage.color} opacity="0.5" />
               </svg>
            )}
            {step === 3 && (
               <svg width="120" height="80" viewBox="0 0 120 80">
                 <circle cx="30" cy="50" r="5" fill="#fbf9f5" stroke={activeStage.color} strokeWidth="2" />
                 <circle cx="90" cy="30" r="5" fill="#fbf9f5" stroke={activeStage.color} strokeWidth="2" />
                 <line x1="35" y1="48" x2="85" y2="32" stroke={activeStage.color} strokeWidth="2" />
                 <text x="60" y="35" fill={activeStage.color} fontSize="10" fontFamily="sans-serif">Δt</text>
               </svg>
            )}
            {step === 4 && (
               <svg width="100" height="80" viewBox="0 0 100 80">
                 <path d="M20,20 L80,20 L80,60 L20,60 Z" fill="none" stroke={activeStage.color} strokeWidth="2" />
                 <line x1="20" y1="35" x2="80" y2="35" stroke={activeStage.color} strokeWidth="1" />
                 <line x1="20" y1="50" x2="80" y2="50" stroke={activeStage.color} strokeWidth="1" />
                 <circle cx="50" cy="42" r="16" fill="none" stroke={activeStage.color} strokeWidth="2" />
                 <path d="M50,42 L60,52" stroke={activeStage.color} strokeWidth="2" />
               </svg>
            )}
            {step === 5 && (
               <svg width="120" height="80" viewBox="0 0 120 80">
                 <line x1="10" y1="70" x2="110" y2="70" stroke={activeStage.color} strokeWidth="2" />
                 <rect x="30" y="50" width="10" height="20" fill={activeStage.color} opacity="0.5" />
                 <rect x="50" y="20" width="10" height="50" fill={activeStage.color} />
                 <rect x="70" y="60" width="10" height="10" fill={activeStage.color} opacity="0.5" />
                 <text x="55" y="15" fill={activeStage.color} fontSize="12" fontWeight="bold" textAnchor="middle">MAX</text>
               </svg>
            )}
          </div>

        </div>
      </div>
    </SlideLayout>
  );
}

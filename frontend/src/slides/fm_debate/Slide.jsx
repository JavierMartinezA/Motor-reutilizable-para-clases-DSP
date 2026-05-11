/**
 * Slide 07 — Debate de cierre · El Vacío de Bessel.
 *
 * Slide de discusión final ("abogados del diablo"). Dos sub-pasos:
 *   1. La pregunta: ¿por qué J₀(2.4) ≈ 0 hace desaparecer la fundamental?
 *   2. La revelación visual: barras del espectro con la portadora apagada
 *      + curvas de Bessel marcando el cruce en I = 2.4048.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  AMBER, INK, INK_MUTED,
  SubStepTabs, BesselSpectrum, BesselChart,
} from '../sintesis_fm/_shared.jsx';

const SUB_ITEMS = [
  { label: 'La pregunta', color: AMBER },
  { label: 'Revelar la respuesta visual', color: AMBER },
];

export default function SlideDebate() {
  const [sub, setSub] = useState(0);

  return (
    <SlideLayout
      sectionId="07"
      sectionLabel="Síntesis FM · Debate de cierre"
      title={<>El <em>vacío de Bessel</em>: la fundamental que se desvanece</>}
      subtitle="Pregunta para los abogados del diablo: ¿por qué J₀(2.4) ≈ 0 borra la portadora del espectro?"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 420 }}>
        <SubStepTabs items={SUB_ITEMS} value={sub} onChange={setSub} />

        {sub === 0 && <PreguntaPanel />}
        {sub === 1 && <RespuestaPanel />}
      </div>
    </SlideLayout>
  );
}

function PreguntaPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: 380, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
          Pregunta para el grupo
        </span>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 28, lineHeight: 1.2, color: INK, margin: 0, fontWeight: 500 }}>
          ¿Por qué <em style={{ color: AMBER }}>J₀(2.4) ≈ 0</em> implica que la
          <strong> frecuencia fundamental desaparece</strong> al subir el índice?
        </h3>
        <div className="math-box" style={{ marginTop: 6 }}>
          <MathFormula t={String.raw`A_{f_c}(I) = J_0(I) \;\;\xrightarrow{I \to 2.4048}\;\; 0`} display />
        </div>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: 14.5, color: INK_MUTED, lineHeight: 1.55 }}>
          Pista: la amplitud de la portadora <em>es exactamente</em> J₀(I). Si J₀ cruza cero, toda la
          energía se ha redistribuido a las bandas laterales — sin filtro, solo geometría.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BesselChart I={2.4048} highlightNull />
      </div>
    </div>
  );
}

function RespuestaPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 380 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22, alignItems: 'start',
      }}>
        <BesselSpectrum fc={220} fm={220} I={2.4048} highlightNull height={280} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
            La revelación
          </span>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: INK, lineHeight: 1.55, margin: 0 }}>
            En el espectro de la izquierda la barra central ha desaparecido. <strong>La fundamental se borra
            sin que ningún filtro la haya tocado</strong>: toda su energía está repartida en las bandas
            laterales |J<sub>n</sub>(2.4)| con n ≠ 0.
          </p>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK_MUTED, lineHeight: 1.5, margin: 0 }}>
            Es la <em>firma acústica</em> de la FM: modular dinámicamente I para que cruce los nulos
            de Bessel emula la transferencia modal de los instrumentos físicos. Por eso una campana FM
            "respira" — pasa por el nulo y vuelve.
          </p>
          <div style={{
            padding: '10px 14px', background: '#fffbf2',
            borderLeft: `3px solid ${AMBER}`, borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: AMBER, lineHeight: 1.5,
          }}>
            corolario práctico: si querés un timbre "metálico puro", parametrizá tu envolvente
            de I para que toque 2.4 al ataque y luego baje.
          </div>
        </div>
      </div>
    </div>
  );
}

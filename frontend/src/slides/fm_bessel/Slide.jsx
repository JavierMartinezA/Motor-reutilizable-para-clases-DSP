/**
 * Slide 04 — Las Funciones de Bessel · acústica sin álgebra.
 *
 * Cuatro sub-pasos internos (revelados por SubStepTabs):
 *   1. I = 0   · tono puro.
 *   2. I ≈ 1–3 · sidebands se asoman.
 *   3. I = 10  · espectro denso.
 *   4. I ≈ 2.4 · nulo de Bessel (la fundamental desaparece).
 */

import { useEffect, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import {
  AMBER, BLUE, RED, INK_MUTED, INK_FAINT,
  SubStepTabs, NarrativeBlock, BesselSpectrum, BesselChart, Slider,
} from '../sintesis_fm/_shared.jsx';

const SUB_ITEMS = [
  { label: 'I = 0  ·  tono puro', color: BLUE },
  { label: 'Revelar sidebands · I≈1–3', color: AMBER },
  { label: 'Revelar espectro denso · I=10', color: RED },
  { label: 'Revelar nulo de Bessel · I≈2.4', color: AMBER },
];

export default function SlideBessel() {
  const [sub, setSub] = useState(0);
  const [I, setI] = useState(0);

  useEffect(() => {
    if (sub === 0) setI(0);
    else if (sub === 1) setI(2);
    else if (sub === 2) setI(10);
    else if (sub === 3) setI(2.4048);
  }, [sub]);

  const isNull = sub === 3;

  return (
    <SlideLayout
      sectionId="04"
      sectionLabel="Síntesis FM · Bessel sin álgebra"
      title={<>La energía se reparte en bandas según <em>J<sub>n</sub>(I)</em></>}
      subtitle="Sin teoría: solo geometría espectral. Subir el índice I redistribuye amplitud hacia los flancos."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 420 }}>
        <SubStepTabs items={SUB_ITEMS} value={sub} onChange={setSub} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <BesselSpectrum fc={220} fm={220} I={I} highlightNull={isNull} height={260} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: INK_FAINT, textAlign: 'center' }}>
              f_c = 220 Hz · ratio 1:1 · amplitudes |J_n(I)| · sin álgebra: solo geometría espectral
            </div>
            <div style={{ marginTop: 6 }}>
              <Slider label="Índice I (control fino)" value={I} min={0} max={12} step={0.05}
                onChange={setI} color={AMBER} format={(v) => v.toFixed(2)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sub === 0 && (
              <NarrativeBlock kicker="Paso 1 · I = 0">
                <p style={{ margin: 0 }}>
                  Sin modulación, la fórmula colapsa a una <strong>senoide pura</strong> en{' '}
                  <span style={{ color: BLUE, fontFamily: "'JetBrains Mono', monospace" }}>f_c</span>.
                  Un único pico central, plano y sin vida.
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13 }}>
                  Toda la energía vive en J₀(0) = 1. Las demás J_n(0) = 0 → no hay sidebands.
                </p>
              </NarrativeBlock>
            )}
            {sub === 1 && (
              <NarrativeBlock kicker="Paso 2 · sidebands se asoman">
                <p style={{ margin: 0 }}>
                  Subiendo I a 1–3 emergen las primeras{' '}
                  <strong style={{ color: AMBER }}>bandas laterales</strong> en f_c ± n·f_m.
                  La energía empieza a fluir hacia los flancos.
                </p>
                <div style={{
                  marginTop: 10, padding: '8px 12px',
                  background: 'rgba(217,119,6,0.10)',
                  borderLeft: `3px solid ${AMBER}`,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: AMBER,
                }}>
                  heurística → bandas audibles ≈ I + 1
                </div>
              </NarrativeBlock>
            )}
            {sub === 2 && (
              <NarrativeBlock kicker="Paso 3 · el espectro estalla">
                <p style={{ margin: 0 }}>
                  Con <strong style={{ color: RED }}>I = 10</strong> emergen{' '}
                  <strong>≥ 21 bandas significativas</strong>. El espectro se vuelve tan denso que se acerca a la
                  textura del <em>ruido</em> — pero sigue siendo determinista, generado por solo 2 osciladores.
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13 }}>
                  Aquí nacen los timbres metálicos brillantes: los "splash" cymbal, los bronces FM,
                  los pads agresivos del DX7.
                </p>
              </NarrativeBlock>
            )}
            {sub === 3 && (
              <NarrativeBlock kicker="Paso 4 · el remate artístico">
                <p style={{ margin: 0 }}>
                  En <strong style={{ color: AMBER }}>I ≈ 2.4048</strong>, el coeficiente J₀(I) cruza
                  exactamente cero. La <strong>frecuencia fundamental desaparece</strong> del espectro
                  sin que ningún filtro la haya tocado.
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13 }}>
                  Modular dinámicamente <em>I</em> con una envolvente que <strong>cruce los nulos de Bessel</strong>
                  emula la <em>transferencia modal</em> de los instrumentos físicos: ese ataque percusivo y vivo —
                  la firma acústica del FM.
                </p>
              </NarrativeBlock>
            )}

            <div style={{ marginTop: 6 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700, marginBottom: 4 }}>
                curvas J_n(I) — dónde estamos
              </div>
              <BesselChart I={I} highlightNull={isNull} />
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

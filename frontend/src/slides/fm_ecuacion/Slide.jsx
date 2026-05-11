/**
 * Slide 03 — La Ecuación y el Plano FM.
 *
 * Tres sub-pasos internos (revelados por SubStepTabs):
 *   1. La ecuación (PM/FM con \underbrace).
 *   2. Armonía: ratios racionales (1:1, 1:2, 1:3).
 *   3. Inarmonía: ratios irracionales (1:√2, π/2, 1:√5).
 */

import { useEffect, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  AMBER, BLUE, RED, INK, INK_MUTED,
  SubStepTabs, NarrativeBlock, PlanoRatioIndice, Slider,
} from '../sintesis_fm/_shared.jsx';

const SUB_ITEMS = [
  { label: 'La ecuación', color: AMBER },
  { label: 'Revelar armonía · racionales', color: BLUE },
  { label: 'Revelar inarmonía · irracionales', color: RED },
];

const FORMULA = String.raw`y(t)\;=\;A\,\sin\!\Bigl(\,\underbrace{2\pi\,\textcolor{#2563eb}{f_c}\, t}_{\text{portadora}}\;+\;\underbrace{\textcolor{#d97706}{I}\,\sin(2\pi\,\textcolor{#c0392b}{f_m}\, t)}_{\text{moduladora atrapada en la fase}}\Bigr)`;

export default function SlideEcuacion() {
  const [sub, setSub] = useState(0);
  const [ratio, setRatio] = useState(1.0);
  const [I, setI] = useState(2.0);

  // Snap automático al cambiar sub-paso (preset pedagógico).
  useEffect(() => {
    if (sub === 1) { setRatio(1.0); setI(3); }
    else if (sub === 2) { setRatio(Math.SQRT2); setI(4); }
  }, [sub]);

  const focus = sub === 1 ? 'arm' : sub === 2 ? 'inarm' : null;

  return (
    <SlideLayout
      sectionId="03"
      sectionLabel="Síntesis FM · Ecuación y plano de timbre"
      title={<>El <em>cincel matemático</em>: dos ejes que esculpen el sonido</>}
      subtitle="Ratio fija si el espectro es armónico o no; índice fija cuánto brillo tiene."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 420 }}>
        <SubStepTabs items={SUB_ITEMS} value={sub} onChange={setSub} />

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: '12px 18px', background: '#fffbf2', borderRadius: 10,
          border: `1px solid rgba(217,119,6,0.22)`,
        }}>
          <div className="math-box" style={{ fontSize: 17 }}>
            <MathFormula t={FORMULA} display />
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_MUTED, marginTop: 2 }}>
            el segundo seno vive <em>dentro</em> del argumento del primero → en la práctica es <strong>modulación de fase (PM)</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PlanoRatioIndice ratio={ratio} I={I} focus={focus} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: '#9e9eb8', textAlign: 'center' }}>
              diseñar un timbre FM = elegir un punto en este plano
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sub === 0 && (
              <NarrativeBlock kicker="Tres parámetros, infinitos timbres">
                <p style={{ margin: 0 }}>
                  Diseñar sonido en FM —como en el DX7— es navegar un{' '}
                  <strong>mapa bidimensional de texturas</strong>: el eje horizontal fija
                  la <em>relación armónica</em> entre osciladores; el vertical, la
                  <em> intensidad del brillo</em>.
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13.5 }}>
                  <span style={{ color: BLUE, fontWeight: 700 }}>f_c</span> = tono base ·{' '}
                  <span style={{ color: RED, fontWeight: 700 }}>f_m</span> = espaciado de los parciales ·{' '}
                  <span style={{ color: AMBER, fontWeight: 700 }}>I</span> = densidad espectral.
                </p>
              </NarrativeBlock>
            )}
            {sub === 1 && (
              <NarrativeBlock kicker="Ratios racionales · armonía">
                <p style={{ margin: 0 }}>
                  Cuando <strong style={{ color: BLUE }}>f_m / f_c ∈ ℚ</strong> (1:1, 1:2, 1:3…), las bandas
                  laterales caen <strong>exactamente sobre la serie armónica</strong>.
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13.5 }}>
                  Resultado: timbres percibidos como <em>una sola nota fundida</em> — pianos eléctricos
                  cristalinos, bronces cálidos, órganos. Es la zona "instrumental" del plano.
                </p>
                <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: BLUE }}>
                  preset → ratio = 1.0 · I = 3
                </div>
              </NarrativeBlock>
            )}
            {sub === 2 && (
              <NarrativeBlock kicker="Ratios irracionales · inarmonía">
                <p style={{ margin: 0 }}>
                  Cuando <strong style={{ color: RED }}>f_m / f_c ∉ ℚ</strong> (1:√2, π/2, 1:√5…), las bandas
                  laterales caen en frecuencias <strong>no relacionadas</strong> con la fundamental.
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 13.5 }}>
                  El espectro se vuelve <em>inarmónico</em>: campanas, gongs, marimbas, percusiones metálicas.
                  El eje <span style={{ color: AMBER, fontWeight: 700 }}>I</span> aquí solo gradúa
                  "cuánto brillo" tiene el ataque.
                </p>
                <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: RED }}>
                  preset → ratio = √2 ≈ 1.414 · I = 4
                </div>
              </NarrativeBlock>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <Slider label="Ratio  f_m / f_c" value={ratio} min={0.3} max={3.2} step={0.01} onChange={setRatio} color={RED} format={(v) => v.toFixed(3)} />
              <Slider label="Índice I" value={I} min={0} max={12} step={0.1} onChange={setI} color={AMBER} format={(v) => v.toFixed(1)} />
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

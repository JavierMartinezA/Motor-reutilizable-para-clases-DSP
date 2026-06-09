/**
 * Clase 11 · MIR & Shazam — Laboratorio completo (lab de juego libre / backup)
 * ===========================================================================
 * Las 5 pestañas del demo del Prof. de la Cuadra en un solo slide. En la
 * narrativa refactorizada cada módulo se embebe inline en su beat
 * (teaser → constelación → hashes → histograma → ruido); este slide queda
 * como "banco de laboratorio" para jugar libremente o como respaldo.
 *
 * Los módulos viven en ../_mir_modules.jsx para poder reutilizarse en cada
 * slide narrativo sin duplicar lógica.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import { VIOLET, AMBER, GREEN, RED, BLUE, SubStepTabs, useMirAudio } from '../_mir_shared.jsx';
import { MiniShazam, Constelacion, Hashes, Ruido, Features } from '../_mir_modules.jsx';

const TABS = [
  { label: '🎵 Mini-Shazam', color: VIOLET },
  { label: '⭐ Constelación', color: AMBER },
  { label: '🔗 Hashes', color: GREEN },
  { label: '🌫️ Ruido / SNR', color: RED },
  { label: '📊 Features', color: BLUE },
];

export default function SlideDemoMIR() {
  const [tab, setTab] = useState(0);
  const audio = useMirAudio();

  return (
    <SlideLayout
      sectionId="LAB"
      sectionLabel="MIR · Laboratorio"
      title={<>Laboratorio: <em>MIR en el navegador</em></>}
      subtitle="Todo corre en tu máquina: STFT, picos, hashes, matching y features. Banco de juego libre."
      footer={<SubStepTabs items={TABS} value={tab} onChange={setTab} />}
    >
      <div style={{ minHeight: 408 }}>
        {tab === 0 && <MiniShazam audio={audio} />}
        {tab === 1 && <Constelacion audio={audio} />}
        {tab === 2 && <Hashes />}
        {tab === 3 && <Ruido audio={audio} />}
        {tab === 4 && <Features audio={audio} />}
      </div>
    </SlideLayout>
  );
}

/**
 * Clase 11 · MIR & Shazam — Slide 07 · La constelación de Wang (2003)
 * ==================================================================
 * IDENTIFICAR, paso 1. Ante el ruido, descartar casi todo el espectrograma y
 * quedarse solo con los picos de energía más intensos: los máximos locales
 * sobreviven a la distorsión. La canción se reduce a una constelación.
 *
 * Llena la rúbrica IDENTIFICAR: ✅ Localización temporal + ✅ Robustez.
 * Embebe <Constelacion /> de _mir_modules.jsx (slider picos/frame en vivo).
 */

import SlideLayout from '../../components/SlideLayout';
import { INK, INK_MUTED, VIOLET, GREEN, AMBER, useMirAudio } from '../_mir_shared.jsx';
import { Constelacion } from '../_mir_modules.jsx';

export default function SlideConstelacionWang() {
  const audio = useMirAudio();

  return (
    <SlideLayout
      sectionId="08"
      sectionLabel="MIR · Constelación"
      title={<>La constelación de <em>Wang (2003)</em></>}
      subtitle="Descarta casi todo el espectrograma; conserva solo los picos. Los máximos locales de energía son lo que resiste el ruido."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: '#fffbf2', borderLeft: `3px solid ${AMBER}`, fontFamily: "'Inter', sans-serif", fontSize: 14, color: INK, lineHeight: 1.5 }}>
            Un pico de energía sobrevive a menos que el ruido <em>en esa misma frecuencia</em> lo supere.
            Insensible a EQ y a la amplitud absoluta: solo importa <strong>dónde</strong> están los picos.
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: '#eefcf2', border: `1px solid ${GREEN}55` }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: GREEN }}>✓</span>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.3 }}>
              rúbrica <strong style={{ color: VIOLET }}>IDENTIFICAR</strong>:<br />Localización temporal · Robustez
            </div>
          </div>
        </div>
        <Constelacion audio={audio} />
      </div>
    </SlideLayout>
  );
}

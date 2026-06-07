/**
 * Clase 11 · MIR & Shazam — Slide 07 · El truco maestro: histograma de offsets
 * Compara, con datos reales, el margen de victoria del conteo simple vs el
 * pico del histograma de t_db − t_query. Correcta = Dirac; incorrecta = nube.
 * Fuentes: presentacion (Slide 7) · slides_11.md (§4) · Marco Teórico.
 */

import { useMemo } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, VIOLET, GREEN, RED,
  OffsetHistogram, FS,
  getSong, getFprint, stft, detectPeaks, makeHashes, matchSimple, matchHistogram,
} from '../_mir_shared.jsx';

export default function SlideHistogramaOffsets() {
  const data = useMemo(() => {
    for (const k of ['A', 'B']) getFprint(k);
    const q = getSong('A').slice(0, Math.floor(1.4 * FS)); // query real desde A
    const hashesQ = makeHashes(detectPeaks(stft(q), 3, -25));
    const simpleA = matchSimple(hashesQ, getFprint('A'));
    const simpleB = matchSimple(hashesQ, getFprint('B'));
    const rA = matchHistogram(hashesQ, getFprint('A'));
    const rB = matchHistogram(hashesQ, getFprint('B'));
    const simpleMargin = simpleB > 0 ? simpleA / simpleB : Infinity;
    const histMargin = rB.score > 0 ? rA.score / rB.score : Infinity;
    return {
      simpleA, simpleB, histA: rA.score, histB: rB.score, simpleMargin, histMargin,
      hists: { 'A · correcta': rA.hist, 'B · incorrecta': rB.hist },
    };
  }, []);

  const fmt = (v) => (isFinite(v) ? v.toFixed(1) + '×' : '∞');

  return (
    <SlideLayout
      sectionId="07"
      sectionLabel="MIR · El Truco Maestro"
      title={<>"Casi funciona" <em>vs</em> "producción"</>}
      subtitle="Contar hashes no basta: en una DB de millones, los hashes espurios coinciden por azar. El filtro es temporal."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#08111d', borderRadius: 10, padding: '16px', color: '#d9c4ff', textAlign: 'center' }}>
            <MathFormula t="\Delta t_{\text{offset}} = t_{db} - t_{query}" display />
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16.5, lineHeight: 1.55, color: INK }}>
            Ante cada match calculamos su offset temporal. Si la query viene de verdad de la canción,
            <strong> todos</strong> los matches válidos comparten el mismo offset.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#eefcf2', borderLeft: `3px solid ${GREEN}`, fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK }}>
              <strong style={{ color: GREEN }}>Correcta →</strong> pico estrecho y alto (delta de Dirac): alineación temporal.
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fbeeee', borderLeft: `3px solid ${RED}`, fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK }}>
              <strong style={{ color: RED }}>Incorrecta →</strong> nube plana (ruido blanco): matches dispersos por azar.
            </div>
          </div>
          <div style={{ padding: '12px 16px', background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`, borderRadius: 6, fontFamily: "'Newsreader', serif", fontSize: 15, fontStyle: 'italic', color: INK, lineHeight: 1.5 }}>
            Shazam no busca la canción con más hashes en común — busca la que genera el <strong>pico</strong> más alto.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            Histograma real · query desde A vs candidatas A/B
          </span>
          <OffsetHistogram hists={data.hists} height={170} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: INK_FAINT, textAlign: 'center' }}>
            A concentra un pico; B se reparte plano
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 4 }}>
            <div style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: INK_MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Margen · conteo simple</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 800, color: INK_MUTED, marginTop: 4 }}>{fmt(data.simpleMargin)}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_FAINT }}>{data.simpleA} vs {data.simpleB}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#f3eefc', border: `1px solid ${VIOLET}55` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: VIOLET, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Margen · histograma</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 800, color: VIOLET, marginTop: 4 }}>{fmt(data.histMargin)}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_FAINT }}>{data.histA} vs {data.histB}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK_MUTED, textAlign: 'center', lineHeight: 1.5 }}>
            El histograma amplía el margen <strong>3–10×</strong>. Esa es la diferencia entre "casi funciona" y "producción".
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

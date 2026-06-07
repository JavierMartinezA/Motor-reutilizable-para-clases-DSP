/**
 * Clase 11 · MIR & Shazam — Slide 04 · Onsets y BPM (flux en vivo)
 * Toca una melodía → spectral flux (derivada positiva del espectro) → picos de
 * onset → estimación de BPM por inter-onset interval.
 * Fuentes: presentacion (Slide 4) · slides_11.md (§2 onset detection).
 */

import { useMemo, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, AMBER, GREEN, BLUE,
  PillButton, FluxNovelty, useMirAudio,
  getSong, getSpec, spectralFlux, estimateBPM, MELODIA_LABELS,
} from '../_mir_shared.jsx';

const SONGS = ['A', 'B', 'C'];

export default function SlideOnsetBPM() {
  const [song, setSong] = useState('A');
  const { playBuffer } = useMirAudio();

  const audio = useMemo(() => getSong(song), [song]);
  const spec = useMemo(() => getSpec(song), [song]);
  const { flux, peaks } = useMemo(() => spectralFlux(spec), [spec]);
  const bpm = useMemo(() => estimateBPM(peaks), [peaks]);

  const handle = (s) => { setSong(s); playBuffer(getSong(s)); };

  return (
    <SlideLayout
      sectionId="04"
      sectionLabel="MIR · Onsets & BPM"
      title={<>El <em>latido</em> del audio: onsets y BPM</>}
      subtitle="Un onset es el inicio de un evento (golpe, ataque, palabra). Se detecta con la derivada positiva del espectro."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {SONGS.map((s) => (
              <PillButton key={s} color={AMBER} kind={song === s ? 'solid' : 'outline'} onClick={() => handle(s)}>
                ▶ {MELODIA_LABELS[s]}
              </PillButton>
            ))}
          </div>
          <FluxNovelty audio={audio} spec={spec} flux={flux} peaks={peaks} height={230} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: INK_FAINT, textAlign: 'center' }}>
            cian = forma de onda · ámbar = spectral flux · verde = onsets detectados (picos de novelty)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#08111d', borderRadius: 10, padding: '14px 16px', color: '#ffd9a8' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9e9eb8', fontWeight: 700, marginBottom: 6 }}>
              Spectral Flux · derivada positiva
            </div>
            <MathFormula t="SF(m) = \sum_{k} \max\bigl(0,\ |X(m,k)| - |X(m\!-\!1,k)|\bigr)" display />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#eefcf2', border: `1px solid ${GREEN}44` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 800, color: GREEN }}>{peaks.length}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED }}>onsets detectados</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#eef4fc', border: `1px solid ${BLUE}44` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 800, color: BLUE }}>{bpm ?? '—'}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED }}>BPM estimado</div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: '#fffbf2', borderLeft: `3px solid ${AMBER}`, borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK, lineHeight: 1.55 }}>
            Los picos de la <em>onset novelty</em> son pulsos en el tiempo. Su <strong>periodicidad</strong>
            {' '}(autocorrelación o Fourier) da el BPM. Onsets = puerta a tempo, segmentación y sincronía audio/MIDI/video.
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

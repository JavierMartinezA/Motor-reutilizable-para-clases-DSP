/**
 * Clase 11 · MIR & Shazam — Slide 06 · Laboratorio en el navegador
 * Port de demo_mir.html a React. 5 módulos en tabs (control del profesor):
 * Mini-Shazam · Constelación · Hashes · Ruido · Features. Todo DSP client-side.
 * Fuentes: presentacion (Slide 6) · demo_mir.html.
 */

import { useMemo, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import {
  INK, INK_MUTED, INK_FAINT, VIOLET, BLUE, RED, AMBER, GREEN,
  PillButton, Slider, SubStepTabs,
  Spectrogram, ScoreBars, OffsetHistogram, FeatureWaveform,
  useMirAudio, MELODIA_LABELS, MELODIAS,
  synthSong, stft, detectPeaks, makeHashes, matchSimple, matchHistogram, addNoise,
  computeFeatures, makeTestAudio,
  getSpec, getPeaks, getFprint, getSong, FS,
} from '../_mir_shared.jsx';

const TABS = [
  { label: '🎵 Mini-Shazam', color: VIOLET },
  { label: '⭐ Constelación', color: AMBER },
  { label: '🔗 Hashes', color: GREEN },
  { label: '🌫️ Ruido / SNR', color: RED },
  { label: '📊 Features', color: BLUE },
];

const cap = { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: INK_FAINT, textAlign: 'center' };
const kicker = { fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 };

export default function SlideDemoMIR() {
  const [tab, setTab] = useState(0);
  const audio = useMirAudio();

  return (
    <SlideLayout
      sectionId="06"
      sectionLabel="MIR · Laboratorio"
      title={<>Laboratorio: <em>MIR en el navegador</em></>}
      subtitle="Todo corre en tu máquina: STFT, picos, hashes, matching y features. El corazón de la clase."
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

// ── Tab 0: Mini-Shazam en vivo ──────────────────────────────────
function MiniShazam({ audio }) {
  const [query, setQuery] = useState('A');
  const [start, setStart] = useState(0);
  const [dur, setDur] = useState(1.5);
  const [result, setResult] = useState(null);

  const identify = () => {
    for (const k of ['A', 'B', 'C']) getFprint(k);
    const full = query === 'X' ? synthSong(MELODIAS.X, 0.24) : getSong(query);
    const s0 = Math.floor(start * FS);
    const s1 = Math.min(full.length, s0 + Math.floor(dur * FS));
    const q = full.slice(s0, s1);
    const specQ = stft(q);
    const peaksQ = detectPeaks(specQ, 3, -25);
    const hashesQ = makeHashes(peaksQ);

    const simple = {}, hist = {}, raw = {};
    for (const name of ['A', 'B', 'C']) {
      simple[name] = matchSimple(hashesQ, getFprint(name));
      const r = matchHistogram(hashesQ, getFprint(name));
      hist[name] = r.score; raw[name] = r.hist;
    }
    const winnerS = Object.keys(simple).reduce((a, b) => (simple[a] > simple[b] ? a : b));
    const winnerH = Object.keys(hist).reduce((a, b) => (hist[a] > hist[b] ? a : b));
    const sorted = Object.values(hist).sort((a, b) => b - a);
    const margin = sorted[1] > 0 ? sorted[0] / sorted[1] : Infinity;
    const ok = sorted[0] > 0 && margin >= 2.0;

    setResult({ specQ, peaksQ, simple, hist, raw, winnerS, winnerH, margin, ok });
    audio.playBuffer(q);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={kicker}>Construye la query</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['A', 'B', 'C', 'X'].map((k) => (
            <PillButton key={k} color={k === 'X' ? RED : VIOLET} kind={query === k ? 'solid' : 'outline'} onClick={() => setQuery(k)}>
              {k === 'X' ? 'Novel (ajena)' : `Query ${k}`}
            </PillButton>
          ))}
        </div>
        <Slider label="inicio del query" value={start} min={0} max={2} step={0.1} onChange={setStart} color={VIOLET} unit=" s" format={(v) => v.toFixed(1)} />
        <Slider label="duración" value={dur} min={0.5} max={2} step={0.1} onChange={setDur} color={VIOLET} unit=" s" format={(v) => v.toFixed(1)} />
        <PillButton color={VIOLET} onClick={identify}>🔎 Identificar</PillButton>
        {result && <Spectrogram spec={result.specQ} peaks={result.peaksQ} peakColor="#00ffff" height={150} />}
        {result && <div style={cap}>constelación de la query (cian)</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          padding: '12px 16px', borderRadius: 10, fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.45,
          background: result ? (result.ok ? '#eefcf2' : '#fbeeee') : '#f3eefc',
          border: `1px solid ${result ? (result.ok ? GREEN : RED) : VIOLET}44`, color: INK,
        }}>
          {!result && <>Aprieta <strong>🔎 Identificar</strong> para ver el veredicto.</>}
          {result && result.ok && <><strong style={{ color: GREEN }}>✓ Identificada: {result.winnerH}.</strong> Pico de histograma dominante, margen {result.margin.toFixed(2)}× sobre la 2ª.</>}
          {result && !result.ok && <><strong style={{ color: RED }}>✗ No identificada.</strong> Ningún pico domina (margen {isFinite(result.margin) ? result.margin.toFixed(2) + '×' : '∞'} &lt; 2×): la query no está en la DB o el ruido la destruyó.</>}
        </div>
        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <span style={{ ...kicker, fontSize: 10 }}>conteo simple</span>
              <div style={{ marginTop: 6 }}><ScoreBars scores={result.simple} winner={result.winnerS} accent={INK_MUTED} /></div>
            </div>
            <div>
              <span style={{ ...kicker, fontSize: 10 }}>histograma de offsets</span>
              <div style={{ marginTop: 6 }}><ScoreBars scores={result.hist} winner={result.winnerH} accent={VIOLET} /></div>
            </div>
          </div>
        )}
        {result && <span style={kicker}>histograma t_db − t_query por canción</span>}
        {result && <OffsetHistogram hists={result.raw} height={140} />}
      </div>
    </div>
  );
}

// ── Tab 1: Constelación ─────────────────────────────────────────
function Constelacion({ audio }) {
  const [song, setSong] = useState('A');
  const [nPeaks, setNPeaks] = useState(3);
  const [thr, setThr] = useState(-25);
  const spec = useMemo(() => getSpec(song), [song]);
  const peaks = useMemo(() => detectPeaks(spec, nPeaks, thr), [spec, nPeaks, thr]);
  const density = (peaks.length / (spec.nFrames * 256 / FS)).toFixed(1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['A', 'B', 'C'].map((k) => (
            <PillButton key={k} color={AMBER} kind={song === k ? 'solid' : 'outline'} onClick={() => { setSong(k); audio.playBuffer(getSong(k)); }}>▶ {k}</PillButton>
          ))}
        </div>
        <Spectrogram spec={spec} peaks={peaks} height={290} />
        <div style={cap}>puntos amarillos = picos detectados (la huella digital)</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={kicker}>parámetros de detección</span>
        <Slider label="picos por frame" value={nPeaks} min={1} max={8} step={1} onChange={setNPeaks} color={AMBER} format={(v) => v.toFixed(0)} />
        <Slider label="umbral mínimo" value={thr} min={-50} max={0} step={1} onChange={setThr} color={AMBER} unit=" dB" format={(v) => v.toFixed(0)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: INK_MUTED, padding: '12px 16px', background: '#fbf9f5', borderRadius: 10, border: '1px solid #e8e3d8' }}>
          <span style={{ color: INK, fontWeight: 700 }}>frames</span><span>{spec.nFrames}</span>
          <span style={{ color: INK, fontWeight: 700 }}>picos</span><span>{peaks.length}</span>
          <span style={{ color: INK, fontWeight: 700 }}>densidad</span><span>{density} /s</span>
        </div>
        <div style={{ padding: '12px 16px', background: '#fffbf2', borderLeft: `3px solid ${AMBER}`, borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.5 }}>
          <strong>Trade-off:</strong> más picos/frame = más información pero también más ruido y una DB gigante. Wang recomienda ~3.
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Hashes ───────────────────────────────────────────────
function Hashes() {
  const [song, setSong] = useState('A');
  const [anchor, setAnchor] = useState(0);
  const [fanout, setFanout] = useState(5);
  const [dtMax, setDtMax] = useState(15);
  const spec = useMemo(() => getSpec(song), [song]);
  const peaks = useMemo(() => getPeaks(song), [song]);
  const total = useMemo(() => makeHashes(peaks, fanout, dtMax).length, [peaks, fanout, dtMax]);
  const anchorIdx = Math.min(anchor, peaks.length - 1);

  // hash actual: primer par válido desde la ancla
  let cur = null;
  for (let j = anchorIdx + 1; j < peaks.length; j++) {
    const dt = peaks[j].fr - peaks[anchorIdx].fr;
    if (dt === 0) continue; if (dt > dtMax) break;
    if (Math.abs(peaks[j].bin - peaks[anchorIdx].bin) > 60) continue;
    cur = `(${peaks[anchorIdx].bin}, ${peaks[j].bin}, ${dt})`; break;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['A', 'B', 'C'].map((k) => (
            <PillButton key={k} color={GREEN} kind={song === k ? 'solid' : 'outline'} onClick={() => { setSong(k); setAnchor(0); }}>{k}</PillButton>
          ))}
        </div>
        <Spectrogram spec={spec} peaks={peaks} anchorIdx={anchorIdx} fanOut={fanout} dtMax={dtMax} height={300} />
        <div style={cap}>rojo = ancla · líneas verdes = pares · recuadro punteado = zona objetivo</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={kicker}>parámetros del fingerprinting</span>
        <Slider label="ancla (índice)" value={anchorIdx} min={0} max={Math.max(1, peaks.length - 1)} step={1} onChange={setAnchor} color={GREEN} format={(v) => v.toFixed(0)} />
        <Slider label="fan-out (pares/ancla)" value={fanout} min={1} max={20} step={1} onChange={setFanout} color={GREEN} format={(v) => v.toFixed(0)} />
        <Slider label="zona objetivo Δt máx" value={dtMax} min={3} max={40} step={1} onChange={setDtMax} color={GREEN} unit=" fr" format={(v) => v.toFixed(0)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: INK_MUTED, padding: '12px 16px', background: '#fbf9f5', borderRadius: 10, border: '1px solid #e8e3d8' }}>
          <span style={{ color: INK, fontWeight: 700 }}>total hashes</span><span>{total}</span>
          <span style={{ color: INK, fontWeight: 700 }}>hash actual</span><span style={{ color: GREEN, fontWeight: 700 }}>{cur ?? '(sin pares)'}</span>
        </div>
        <div style={{ padding: '12px 16px', background: '#eefcf2', borderLeft: `3px solid ${GREEN}`, borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.5 }}>
          El espacio es enorme: 1024×1024×16 ≈ <strong>17M cubetas</strong>. Cada canción usa ~10k. Colisiones casuales: raras.
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Ruido / SNR ──────────────────────────────────────────
function Ruido({ audio }) {
  const [song, setSong] = useState('A');
  const [snr, setSnr] = useState(10);
  const [res, setRes] = useState(null);

  const run = () => {
    for (const k of ['A', 'B', 'C']) getFprint(k);
    const clean = getSong(song).slice(0, Math.floor(1.5 * FS));
    const noisy = addNoise(clean, snr);
    const specN = stft(noisy);
    const peaksN = detectPeaks(specN, 3, -25);
    const hashesN = makeHashes(peaksN);
    const scores = {};
    for (const name of ['A', 'B', 'C']) scores[name] = matchHistogram(hashesN, getFprint(name)).score;
    const winner = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
    const sorted = Object.values(scores).sort((a, b) => b - a);
    const ratio = sorted[1] > 0 ? (sorted[0] / sorted[1]) : Infinity;
    setRes({ specN, peaksN, winner, ratio, ok: winner === song, npks: peaksN.length });
    audio.playBuffer(noisy);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {['A', 'B', 'C'].map((k) => (
            <PillButton key={k} color={RED} kind={song === k ? 'solid' : 'outline'} onClick={() => setSong(k)}>{k}</PillButton>
          ))}
          <PillButton color={RED} onClick={run}>🔎 Identificar con este SNR</PillButton>
        </div>
        {res ? <Spectrogram spec={res.specN} peaks={res.peaksN} height={250} /> : <div style={{ height: 250, borderRadius: 8, background: '#08111d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK_FAINT, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>aprieta Identificar</div>}
        <div style={cap}>picos válidos mezclados con falsos picos de ruido</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={kicker}>nivel de ruido</span>
        <Slider label="SNR" value={snr} min={-20} max={30} step={1} onChange={setSnr} color={RED} unit=" dB" format={(v) => v.toFixed(0)} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_FAINT, lineHeight: 1.4 }}>
          +30 = casi sin ruido · 0 = ruido al nivel de la señal · −10 = ruido domina.
        </div>
        {res && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: INK_MUTED, padding: '12px 16px', background: '#fbf9f5', borderRadius: 10, border: '1px solid #e8e3d8' }}>
            <span style={{ color: INK, fontWeight: 700 }}>identificada</span><span style={{ color: res.ok ? GREEN : RED, fontWeight: 700 }}>{res.winner} {res.ok ? '✓' : '✗'}</span>
            <span style={{ color: INK, fontWeight: 700 }}>score relativo</span><span>{isFinite(res.ratio) ? res.ratio.toFixed(2) + '×' : '∞'}</span>
            <span style={{ color: INK, fontWeight: 700 }}>picos query</span><span>{res.npks}</span>
          </div>
        )}
        <div style={{ padding: '12px 16px', background: '#fbeeee', borderLeft: `3px solid ${RED}`, borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK, lineHeight: 1.5 }}>
          Desafío: <strong>¿a qué SNR se rompe?</strong> Baja el slider lentamente — suele sobrevivir hasta ≈ −10/−15 dB, porque los pares son <em>geométricos</em>, no espectrales.
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Features ─────────────────────────────────────────────
function Features({ audio }) {
  const [kind, setKind] = useState('violin');
  const a = useMemo(() => makeTestAudio(kind), [kind]);
  const f = useMemo(() => computeFeatures(a), [a]);
  const SOUNDS = [
    { id: 'violin', label: '🎻 Armónico', color: BLUE }, { id: 'drum', label: '🥁 Percusivo', color: RED },
    { id: 'noise', label: '📡 Ruido', color: INK_MUTED }, { id: 'voice', label: '🗣️ Habla', color: AMBER },
  ];
  const ROWS = [
    ['ZCR', f.zcr.toFixed(0), VIOLET], ['Centroide', f.centroid.toFixed(0) + ' Hz', BLUE],
    ['Rolloff 85%', f.rolloff.toFixed(0) + ' Hz', GREEN], ['Flatness', f.flatness.toFixed(3), RED], ['RMS', f.rms.toFixed(3), AMBER],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SOUNDS.map((s) => (
            <PillButton key={s.id} color={s.color} kind={kind === s.id ? 'solid' : 'outline'} onClick={() => { setKind(s.id); audio.playBuffer(makeTestAudio(s.id)); }}>{s.label}</PillButton>
          ))}
        </div>
        <FeatureWaveform audio={a} height={250} />
        <div style={cap}>forma de onda (cian) + envolvente RMS (naranja)</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={kicker}>valores en vivo</span>
        {ROWS.map(([label, val, color]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 14px', borderRadius: 8, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED }}>{label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color }}>{val}</span>
          </div>
        ))}
        <div style={{ padding: '11px 14px', background: '#eef4fc', borderLeft: `3px solid ${BLUE}`, borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 12, color: INK, lineHeight: 1.5 }}>
          Refuerza el slide 3: el ruido lleva flatness→1, el percusivo sube ZCR, el armónico baja el centroide.
        </div>
      </div>
    </div>
  );
}

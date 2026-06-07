/**
 * _mir_shared.jsx — Toolkit de laboratorio para la Clase 11 (MIR & Shazam).
 * =========================================================================
 * Porta el motor DSP de `_template/_reference/demo_mir.html` a funciones puras
 * (FFT/STFT/peak-picking/hashes/matching/features) + componentes React de
 * canvas, siguiendo el mismo patrón que `sintesis_fm/_shared.jsx`.
 *
 * Todo el DSP corre client-side. Sin backend. Las canciones, espectros,
 * picos y fingerprints se cachean por clave (igual que el demo).
 *
 * Convenciones:
 *   - Canvas oscuro SOLO para datos espectrales (permitido por la regla
 *     threejs-canvas), enmarcado en panel cream.
 *   - Audio se silencia al desmontar la slide (useMirAudio cleanup).
 *   - UI (PillButton, Slider, SubStepTabs, ...) se reexporta del toolkit FM
 *     para no duplicar estética.
 */

import { useEffect, useRef, useCallback } from 'react';

// Reexport de la paleta + UI ya probada en Síntesis FM.
export {
  BLUE, RED, AMBER, VIOLET, GREEN, INK, INK_MUTED, INK_FAINT, CREAM,
  PillButton, Slider, SubStepTabs, RevealButton, NarrativeBlock,
} from './sintesis_fm/_shared.jsx';

// Acentos propios del demo MIR (canvas oscuro).
export const MIR_VIOLET = '#7c3aed';
export const PEAK_YELLOW = '#ffeb3b';
export const QUERY_CYAN = '#00ffff';
export const PAIR_GREEN = '#6ddb7a';
export const ANCHOR_RED = '#ff5577';

// ============================================================
// Constantes DSP (idénticas al demo para reproducibilidad)
// ============================================================
export const FS = 44100;
export const N_FFT = 1024;   // bins chicos → canvas legible
export const HOP = 256;

// ============================================================
// Melodías de referencia (notas en Hz)
// ============================================================
export const MELODIAS = {
  A: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // escala Do
  B: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63, 220.00, 174.61], // arpegio Lam
  C: [196.00, 246.94, 293.66, 392.00, 246.94, 196.00, 146.83, 196.00], // quintas Sol
  X: [311.13, 392.00, 415.30, 466.16, 311.13, 369.99, 466.16, 415.30], // "novel" (fuera de DB)
};

export const MELODIA_LABELS = {
  A: 'Melodía A · escala Do',
  B: 'Melodía B · arpegio Lam',
  C: 'Melodía C · quintas Sol',
  X: 'Query "novel" · ajena a la DB',
};

// ============================================================
// Síntesis de melodías (3 armónicos con decay exponencial)
// ============================================================
export function synthSong(notas, durNota = 0.3, fs = FS) {
  const out = [];
  for (const f0 of notas) {
    const N = Math.floor(durNota * fs);
    const t = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const tt = i / fs;
      const env = Math.exp(-tt / 0.5);
      t[i] = env * (Math.sin(2 * Math.PI * f0 * tt)
        + 0.5 * Math.sin(2 * Math.PI * 2 * f0 * tt)
        + 0.25 * Math.sin(2 * Math.PI * 3 * f0 * tt));
    }
    out.push(t);
    out.push(new Float32Array(Math.floor(0.02 * fs))); // silencio entre notas
  }
  const total = out.reduce((s, a) => s + a.length, 0);
  const result = new Float32Array(total);
  let off = 0;
  for (const a of out) { result.set(a, off); off += a.length; }
  let peak = 0;
  for (let i = 0; i < result.length; i++) peak = Math.max(peak, Math.abs(result[i]));
  if (peak > 0) for (let i = 0; i < result.length; i++) result[i] /= peak * 1.3;
  return result;
}

// ============================================================
// FFT iterativa Cooley-Tukey (in-place, n potencia de 2)
// ============================================================
export function fft(re, im) {
  const n = re.length;
  if ((n & (n - 1)) !== 0) throw new Error('FFT size must be power of 2');
  let j = 0;
  for (let i = 1; i < n - 1; i++) {
    let bit = n >> 1;
    for (; (j & bit) !== 0; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let size = 2; size <= n; size *= 2) {
    const halfsize = size / 2;
    const tablestep = n / size;
    for (let i = 0; i < n; i += size) {
      for (let k = 0, ti = 0; k < halfsize; k++, ti += tablestep) {
        const angle = -2 * Math.PI * ti / n;
        const wr = Math.cos(angle), wi = Math.sin(angle);
        const xr = re[i + k + halfsize] * wr - im[i + k + halfsize] * wi;
        const xi = re[i + k + halfsize] * wi + im[i + k + halfsize] * wr;
        re[i + k + halfsize] = re[i + k] - xr;
        im[i + k + halfsize] = im[i + k] - xi;
        re[i + k] += xr;
        im[i + k] += xi;
      }
    }
  }
}

// ============================================================
// STFT → magnitud en dB. Devuelve { data, nFrames, nBins }.
// ============================================================
export function stft(audio, nFft = N_FFT, hop = HOP) {
  const nFrames = Math.max(1, Math.floor((audio.length - nFft) / hop) + 1);
  const win = new Float32Array(nFft);
  for (let i = 0; i < nFft; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (nFft - 1));
  const nBins = nFft / 2 + 1;
  const result = new Float32Array(nFrames * nBins);
  for (let fr = 0; fr < nFrames; fr++) {
    const re = new Float32Array(nFft), im = new Float32Array(nFft);
    for (let i = 0; i < nFft; i++) re[i] = (audio[fr * hop + i] || 0) * win[i];
    fft(re, im);
    for (let k = 0; k < nBins; k++) {
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      result[fr * nBins + k] = 20 * Math.log10(mag + 1e-9);
    }
  }
  return { data: result, nFrames, nBins };
}

// ============================================================
// Peak picking 2D — máximos locales fuertes por frame.
// ============================================================
export function detectPeaks(spec, nPerFrame = 3, minDb = -25) {
  const peaks = [];
  const { nFrames, nBins } = spec;
  for (let fr = 0; fr < nFrames; fr++) {
    const bins = [];
    for (let k = 1; k < nBins - 1; k++) {
      const v = spec.data[fr * nBins + k];
      if (v > spec.data[fr * nBins + k - 1] && v > spec.data[fr * nBins + k + 1] && v > minDb) {
        bins.push({ bin: k, val: v });
      }
    }
    bins.sort((a, b) => b.val - a.val);
    for (let i = 0; i < Math.min(nPerFrame, bins.length); i++) {
      peaks.push({ fr, bin: bins[i].bin, val: bins[i].val });
    }
  }
  return peaks;
}

// ============================================================
// Hashes de pares ancla-target: (f1, f2, Δt) + t1.
// ============================================================
export function makeHashes(peaks, fanOut = 5, dtMax = 15, dfMax = 60) {
  const hashes = [];
  const sorted = [...peaks].sort((a, b) => a.fr - b.fr);
  for (let i = 0; i < sorted.length; i++) {
    let count = 0;
    for (let j = i + 1; j < sorted.length; j++) {
      const dt = sorted[j].fr - sorted[i].fr;
      if (dt === 0) continue;
      if (dt > dtMax) break;
      if (Math.abs(sorted[j].bin - sorted[i].bin) > dfMax) continue;
      hashes.push({ f1: sorted[i].bin, f2: sorted[j].bin, dt, t1: sorted[i].fr });
      count++;
      if (count >= fanOut) break;
    }
  }
  return hashes;
}

// ============================================================
// Matching simple (conteo) y con histograma de offsets.
// ============================================================
function buildIndex(dbHashes, dfTol, dtTol) {
  const idx = new Map();
  for (const h of dbHashes) {
    const key = `${Math.floor(h.f1 / (dfTol || 1))},${Math.floor(h.f2 / (dfTol || 1))},${Math.floor(h.dt / (dtTol || 1))}`;
    if (!idx.has(key)) idx.set(key, []);
    idx.get(key).push(h);
  }
  return idx;
}

export function matchSimple(queryHashes, dbHashes, dfTol = 0, dtTol = 0) {
  const dbIndex = buildIndex(dbHashes, dfTol, dtTol);
  let matches = 0;
  for (const qh of queryHashes) {
    const bx = Math.floor(qh.f1 / (dfTol || 1)), by = Math.floor(qh.f2 / (dfTol || 1)), bz = Math.floor(qh.dt / (dtTol || 1));
    outer: for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const arr = dbIndex.get(`${bx + dx},${by + dy},${bz + dz}`);
          if (!arr) continue;
          for (const dh of arr) {
            if (Math.abs(qh.f1 - dh.f1) <= dfTol && Math.abs(qh.f2 - dh.f2) <= dfTol && Math.abs(qh.dt - dh.dt) <= dtTol) {
              matches++; break outer;
            }
          }
        }
  }
  return matches;
}

export function matchHistogram(queryHashes, dbHashes, dfTol = 0, dtTol = 0) {
  const dbIndex = buildIndex(dbHashes, dfTol, dtTol);
  const offsets = [];
  for (const qh of queryHashes) {
    const bx = Math.floor(qh.f1 / (dfTol || 1)), by = Math.floor(qh.f2 / (dfTol || 1)), bz = Math.floor(qh.dt / (dtTol || 1));
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const arr = dbIndex.get(`${bx + dx},${by + dy},${bz + dz}`);
          if (!arr) continue;
          for (const dh of arr) {
            if (Math.abs(qh.f1 - dh.f1) <= dfTol && Math.abs(qh.f2 - dh.f2) <= dfTol && Math.abs(qh.dt - dh.dt) <= dtTol) {
              offsets.push(dh.t1 - qh.t1);
            }
          }
        }
  }
  if (!offsets.length) return { score: 0, hist: new Map() };
  const counts = new Map();
  for (const o of offsets) counts.set(o, (counts.get(o) || 0) + 1);
  let peak = 0;
  for (const v of counts.values()) if (v > peak) peak = v;
  return { score: peak, hist: counts };
}

// ============================================================
// Ruido blanco a un SNR objetivo (dB).
// ============================================================
export function addNoise(audio, snrDb) {
  let pow = 0;
  for (let i = 0; i < audio.length; i++) pow += audio[i] * audio[i];
  pow /= audio.length;
  const np = pow / Math.pow(10, snrDb / 10);
  const sigma = Math.sqrt(np);
  const noisy = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) noisy[i] = audio[i] + (Math.random() * 2 - 1) * sigma * 1.4;
  return noisy;
}

// ============================================================
// Features de bajo nivel: ZCR, centroide, rolloff, flatness, RMS.
// ============================================================
export function computeFeatures(audio) {
  let zcr = 0;
  for (let i = 1; i < audio.length; i++) if ((audio[i] >= 0) !== (audio[i - 1] >= 0)) zcr++;
  zcr = zcr / (audio.length / FS);

  let rms = 0;
  for (let i = 0; i < audio.length; i++) rms += audio[i] * audio[i];
  rms = Math.sqrt(rms / audio.length);

  const nFft = 4096;
  const re = new Float32Array(nFft), im = new Float32Array(nFft);
  const seg = audio.slice(Math.floor(audio.length / 2), Math.floor(audio.length / 2) + nFft);
  for (let i = 0; i < seg.length; i++) re[i] = seg[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / nFft));
  fft(re, im);
  let totalE = 0, weightedF = 0;
  const mags = new Float32Array(nFft / 2);
  for (let k = 0; k < nFft / 2; k++) {
    const m = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    mags[k] = m;
    totalE += m;
    weightedF += m * (k * FS / nFft);
  }
  const centroid = totalE > 0 ? weightedF / totalE : 0;

  let rolloff = 0, cumE = 0;
  for (let k = 0; k < nFft / 2; k++) {
    cumE += mags[k];
    if (cumE >= 0.85 * totalE) { rolloff = k * FS / nFft; break; }
  }

  let logSum = 0, arithSum = 0, nonzero = 0;
  for (let k = 1; k < nFft / 2; k++) {
    const m = mags[k] + 1e-9;
    logSum += Math.log(m); arithSum += m; nonzero++;
  }
  const geom = Math.exp(logSum / nonzero);
  const flatness = geom / (arithSum / nonzero + 1e-9);

  return { zcr, centroid, rolloff, flatness, rms };
}

// Sonidos de prueba para el módulo de features.
export function makeTestAudio(kind, dur = 2.0) {
  const N = Math.floor(dur * FS);
  const out = new Float32Array(N);
  if (kind === 'violin') {
    for (let i = 0; i < N; i++) {
      const t = i / FS;
      const env = Math.min(1, t * 4) * Math.exp(-Math.max(0, t - 1.5) * 3);
      out[i] = env * (Math.sin(2 * Math.PI * 440 * t) + 0.4 * Math.sin(2 * Math.PI * 880 * t) + 0.2 * Math.sin(2 * Math.PI * 1320 * t)) * 0.4;
    }
  } else if (kind === 'drum') {
    for (let i = 0; i < N; i++) {
      const t = i / FS;
      const env = Math.exp(-t * 8);
      const tonal = Math.sin(2 * Math.PI * 80 * t);
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 25);
      out[i] = env * (tonal * 0.6 + noise * 0.4) * 0.6;
    }
  } else if (kind === 'noise') {
    for (let i = 0; i < N; i++) out[i] = (Math.random() * 2 - 1) * 0.3;
  } else if (kind === 'voice') {
    for (let i = 0; i < N; i++) {
      const t = i / FS;
      const f0 = 150 + 30 * Math.sin(2 * Math.PI * 3 * t) + 10 * Math.sin(2 * Math.PI * 15 * t);
      const f1 = Math.sin(2 * Math.PI * f0 * t) * 0.3;
      const f2 = Math.sin(2 * Math.PI * f0 * 2.5 * t) * 0.15;
      const f3 = Math.sin(2 * Math.PI * f0 * 4 * t) * 0.08;
      const env = (Math.sin(2 * Math.PI * 4 * t) > 0 ? 1 : 0.1);
      out[i] = env * (f1 + f2 + f3) * 0.5;
    }
  }
  return out;
}

// ============================================================
// Spectral flux (función de novelty) para onsets.
//   SF(m) = Σ_k max(0, |X(m,k)| - |X(m-1,k)|)   (en lineal)
// Devuelve { flux: Float32Array(nFrames), peaks: [frameIdx] }.
// ============================================================
export function spectralFlux(spec) {
  const { nFrames, nBins } = spec;
  const flux = new Float32Array(nFrames);
  for (let fr = 1; fr < nFrames; fr++) {
    let s = 0;
    for (let k = 0; k < nBins; k++) {
      // pasar de dB a magnitud lineal aproximada para la diferencia positiva
      const cur = Math.pow(10, spec.data[fr * nBins + k] / 20);
      const prev = Math.pow(10, spec.data[(fr - 1) * nBins + k] / 20);
      const d = cur - prev;
      if (d > 0) s += d;
    }
    flux[fr] = s;
  }
  // normalizar
  let mx = 0;
  for (let i = 0; i < nFrames; i++) mx = Math.max(mx, flux[i]);
  if (mx > 0) for (let i = 0; i < nFrames; i++) flux[i] /= mx;
  // picos sobre umbral adaptativo simple
  const peaks = [];
  const thr = 0.18;
  for (let fr = 2; fr < nFrames - 2; fr++) {
    const v = flux[fr];
    if (v > thr && v >= flux[fr - 1] && v > flux[fr + 1] && v >= flux[fr - 2] && v > flux[fr + 2]) {
      peaks.push(fr);
    }
  }
  return { flux, peaks };
}

// Estima BPM desde los frames de onset (periodo dominante de inter-onsets).
export function estimateBPM(onsetFrames, hop = HOP, fs = FS) {
  if (onsetFrames.length < 2) return null;
  const iois = [];
  for (let i = 1; i < onsetFrames.length; i++) {
    iois.push((onsetFrames[i] - onsetFrames[i - 1]) * hop / fs);
  }
  iois.sort((a, b) => a - b);
  const med = iois[Math.floor(iois.length / 2)];
  if (med <= 0) return null;
  return Math.round(60 / med);
}

// ============================================================
// Cache por clave (canción → audio/spec/peaks/fingerprint)
// ============================================================
const _cache = { SONGS: {}, SPECS: {}, PEAKS: {}, FPRINTS: {} };
export function ensureSong(key) {
  if (!_cache.SONGS[key]) {
    _cache.SONGS[key] = synthSong(MELODIAS[key]);
    _cache.SPECS[key] = stft(_cache.SONGS[key]);
    _cache.PEAKS[key] = detectPeaks(_cache.SPECS[key], 3, -25);
    _cache.FPRINTS[key] = makeHashes(_cache.PEAKS[key]);
  }
  return _cache;
}
export function getSpec(key) { ensureSong(key); return _cache.SPECS[key]; }
export function getPeaks(key) { ensureSong(key); return _cache.PEAKS[key]; }
export function getFprint(key) { ensureSong(key); return _cache.FPRINTS[key]; }
export function getSong(key) { ensureSong(key); return _cache.SONGS[key]; }

// ============================================================
// useMirAudio — reproduce Float32Array y silencia al desmontar.
// ============================================================
export function useMirAudio() {
  const ctxRef = useRef(null);
  const srcRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AC({ sampleRate: FS });
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const stop = useCallback(() => {
    if (srcRef.current) { try { srcRef.current.stop(); } catch { /* noop */ } srcRef.current = null; }
  }, []);

  const playBuffer = useCallback((audio, onended) => {
    stop();
    const ctx = getCtx();
    const buf = ctx.createBuffer(1, audio.length, ctx.sampleRate);
    buf.getChannelData(0).set(audio);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.onended = () => { if (srcRef.current === src) srcRef.current = null; onended?.(); };
    src.start();
    srcRef.current = src;
    return src;
  }, [getCtx, stop]);

  useEffect(() => () => {
    stop();
    if (ctxRef.current) { try { ctxRef.current.close(); } catch { /* noop */ } ctxRef.current = null; }
  }, [stop]);

  return { playBuffer, stop };
}

// ============================================================
// CANVAS COMPONENTS
// ============================================================
const SPEC_BG = '#08111d';
const Y_MAX_BIN = 220; // límite visible del espectrograma (≈ 9.5 kHz a N_FFT=1024)

function paintSpectrogram(ctx, W, H, spec, { yMaxBin = Y_MAX_BIN } = {}) {
  ctx.fillStyle = SPEC_BG; ctx.fillRect(0, 0, W, H);
  const { nFrames, nBins } = spec;
  const img = ctx.createImageData(W, H);
  for (let x = 0; x < W; x++) {
    const fr = Math.floor(x / W * nFrames);
    if (fr >= nFrames) continue;
    for (let y = 0; y < H; y++) {
      const bin = Math.floor((1 - y / H) * yMaxBin);
      const db = spec.data[fr * nBins + bin];
      const v = Math.max(0, Math.min(1, (db + 60) / 70));
      const r = Math.floor(255 * Math.pow(v, 0.7));
      const g = Math.floor(60 * v + 30 * Math.pow(v, 3));
      const b = Math.floor(120 * (1 - v) * v * 4 + 30 * (1 - v));
      const idx = (y * W + x) * 4;
      img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * <Spectrogram> — espectrograma + constelación opcional + pares ancla-target.
 * props:
 *   spec       {data,nFrames,nBins}
 *   peaks      [{fr,bin}]            puntos amarillos (o color custom)
 *   peakColor  string
 *   anchorIdx  number|null           dibuja zona objetivo + pares desde esa ancla
 *   fanOut, dtMax, dfMax
 *   height     number
 */
export function Spectrogram({
  spec, peaks = null, peakColor = PEAK_YELLOW,
  anchorIdx = null, fanOut = 5, dtMax = 15, dfMax = 60,
  height = 300,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !spec) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    paintSpectrogram(ctx, W, H, spec);
    const { nFrames } = spec;

    if (peaks && peaks.length) {
      ctx.fillStyle = peakColor;
      for (const p of peaks) {
        if (p.bin >= Y_MAX_BIN) continue;
        const x = (p.fr / nFrames) * W;
        const y = (1 - p.bin / Y_MAX_BIN) * H;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 2 * Math.PI); ctx.fill();
      }
    }

    if (anchorIdx != null && peaks && anchorIdx >= 0 && anchorIdx < peaks.length) {
      const anchor = peaks[anchorIdx];
      const x1 = (anchor.fr / nFrames) * W;
      const y1 = (1 - anchor.bin / Y_MAX_BIN) * H;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x1, Math.max(0, y1 - 50), (dtMax / nFrames) * W, 100);
      ctx.setLineDash([]);
      ctx.fillStyle = ANCHOR_RED;
      ctx.beginPath(); ctx.arc(x1, y1, 6, 0, 2 * Math.PI); ctx.fill();
      let count = 0;
      for (let j = anchorIdx + 1; j < peaks.length && count < fanOut; j++) {
        const dt = peaks[j].fr - anchor.fr;
        if (dt === 0) continue;
        if (dt > dtMax) break;
        if (Math.abs(peaks[j].bin - anchor.bin) > dfMax) continue;
        const x2 = (peaks[j].fr / nFrames) * W;
        const y2 = (1 - peaks[j].bin / Y_MAX_BIN) * H;
        ctx.strokeStyle = PAIR_GREEN; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = PAIR_GREEN;
        ctx.beginPath(); ctx.arc(x2, y2, 3.5, 0, 2 * Math.PI); ctx.fill();
        count++;
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px monospace';
    ctx.fillText('t →', W - 26, H - 6);
    ctx.fillText('Hz', 4, 12);
    ctx.fillText(`${Math.floor(Y_MAX_BIN * FS / N_FFT)} Hz`, 4, 24);
  }, [spec, peaks, peakColor, anchorIdx, fanOut, dtMax, dfMax]);

  return (
    <canvas ref={ref} width={1100} height={height}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, border: '1px solid #292e4a' }} />
  );
}

/** <ScoreBars> — barras horizontales de score por canción. */
export function ScoreBars({ scores, winner, accent = MIR_VIOLET }) {
  const maxScore = Math.max(1, ...Object.values(scores));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Object.entries(scores).map(([name, score]) => {
        const pct = (score / maxScore * 100).toFixed(1);
        const isWin = name === winner;
        return (
          <div key={name} style={{
            position: 'relative', height: 28, borderRadius: 4, overflow: 'hidden',
            background: '#ece8df', boxShadow: isWin ? `0 0 0 2px ${PAIR_GREEN}` : 'none',
          }}>
            <div style={{ height: '100%', width: `${pct}%`, transition: 'width 0.3s', background: `linear-gradient(90deg, ${accent}, #4ec3ff)` }} />
            <span style={{ position: 'absolute', left: 10, top: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#1a1a2e', fontWeight: 700 }}>{name}</span>
            <span style={{ position: 'absolute', right: 10, top: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#1a1a2e', fontWeight: 700 }}>{score}</span>
          </div>
        );
      })}
    </div>
  );
}

/** <OffsetHistogram> — histograma de t_db − t_query por canción (canvas oscuro). */
export function OffsetHistogram({ hists, height = 160 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !hists) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = SPEC_BG; ctx.fillRect(0, 0, W, H);
    const dbNames = Object.keys(hists);
    const colors = ['#b86dff', '#4ec3ff', '#6ddb7a', '#ffb042'];
    let allOffsets = [];
    for (const h of Object.values(hists)) for (const o of h.keys()) allOffsets.push(o);
    if (!allOffsets.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '13px monospace';
      ctx.fillText('sin matches — corre una identificación', 12, H / 2);
      return;
    }
    const minO = Math.min(...allOffsets), maxO = Math.max(...allOffsets);
    const range = Math.max(1, maxO - minO);
    let maxCount = 0;
    for (const h of Object.values(hists)) for (const c of h.values()) if (c > maxCount) maxCount = c;
    const barW = W / range;
    const sectionH = H / dbNames.length;
    dbNames.forEach((name, idx) => {
      ctx.fillStyle = colors[idx % colors.length];
      ctx.font = '11px monospace';
      ctx.fillText(name, 6, idx * sectionH + 14);
      const hist = hists[name];
      for (const [o, c] of hist) {
        const x = ((o - minO) / range) * W;
        const h = (c / maxCount) * (sectionH - 18);
        ctx.fillRect(x, (idx + 1) * sectionH - h, Math.max(1, barW), h);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.moveTo(0, (idx + 1) * sectionH); ctx.lineTo(W, (idx + 1) * sectionH); ctx.stroke();
    });
  }, [hists]);
  return (
    <canvas ref={ref} width={1300} height={height}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, border: '1px solid #292e4a' }} />
  );
}

/** <FeatureWaveform> — waveform (cian) + envolvente RMS (naranja). */
export function FeatureWaveform({ audio, height = 200 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !audio) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = SPEC_BG; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#4ec3ff'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const i = Math.floor(x / W * audio.length);
      const y = H / 2 - audio[i] * H * 0.4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    const win = Math.max(1, Math.floor(audio.length / W));
    ctx.strokeStyle = '#ffb042'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let k = 0; k < win; k++) { const v = audio[x * win + k] || 0; s += v * v; }
      const rms = Math.sqrt(s / win);
      const y = H / 2 - rms * H * 0.8;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [audio]);
  return (
    <canvas ref={ref} width={1100} height={height}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, border: '1px solid #292e4a' }} />
  );
}

/** <FluxNovelty> — waveform arriba + función de flux con picos de onset abajo. */
export function FluxNovelty({ audio, spec, flux, peaks, height = 220 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !audio || !flux) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const midY = H * 0.42;
    ctx.fillStyle = SPEC_BG; ctx.fillRect(0, 0, W, H);

    // waveform (mitad superior)
    ctx.strokeStyle = '#4ec3ff'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const i = Math.floor(x / W * audio.length);
      const y = midY / 2 - audio[i] * midY * 0.4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // separador
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

    // flux (mitad inferior)
    const baseY = H - 18;
    const fluxH = baseY - midY - 8;
    ctx.fillStyle = 'rgba(217,119,6,0.25)';
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.beginPath();
    const n = flux.length;
    for (let x = 0; x < W; x++) {
      const fr = Math.floor(x / W * n);
      const y = baseY - flux[fr] * fluxH;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // picos de onset (líneas verticales verdes)
    if (peaks) {
      ctx.strokeStyle = PAIR_GREEN; ctx.lineWidth = 1.5;
      for (const fr of peaks) {
        const x = (fr / n) * W;
        ctx.beginPath(); ctx.moveTo(x, midY + 4); ctx.lineTo(x, baseY); ctx.stroke();
        ctx.fillStyle = PAIR_GREEN;
        ctx.beginPath(); ctx.arc(x, midY + 6, 3, 0, 2 * Math.PI); ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px monospace';
    ctx.fillText('forma de onda', 6, 12);
    ctx.fillText('spectral flux + onsets', 6, midY + 14);
  }, [audio, spec, flux, peaks]);
  return (
    <canvas ref={ref} width={1100} height={height}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, border: '1px solid #292e4a' }} />
  );
}

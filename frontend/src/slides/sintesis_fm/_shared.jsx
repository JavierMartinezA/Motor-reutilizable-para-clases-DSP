/**
 * _shared.jsx — Helpers, paleta y motor reutilizado por las 5 slides
 * de la sesión 09 de síntesis FM (más la de cierre / Bessel null).
 *
 * Cada slide mantiene su propio `step` interno y usa SubStepTabs / RevealButton
 * como única navegación. La navegación entre slides la maneja App.jsx.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// === Paleta canónica (CLAUDE.md) ===
export const BLUE = '#2563eb';   // f_c (Carrier)
export const RED = '#c0392b';    // f_m (Modulator)
export const AMBER = '#d97706';  // I (Index) / advertencia / transición
export const VIOLET = '#7c3aed'; // espectro / pipeline
export const GREEN = '#16a34a';  // racional / armónico / aceptación
export const INK = '#1a1a2e';
export const INK_MUTED = '#6b6b8a';
export const INK_FAINT = '#9e9eb8';
export const CREAM = '#faf8f3';

// ============================================================
// Bessel J_n(x) — serie de potencias (estable para n ≤ 12, x ≤ 14)
// ============================================================
function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i += 1) r *= i;
  return r;
}
export function besselJ(n, x) {
  if (x === 0) return n === 0 ? 1 : 0;
  let sum = 0;
  const halfX = x / 2;
  for (let m = 0; m < 40; m += 1) {
    const denom = factorial(m) * factorial(m + n);
    if (!isFinite(denom)) break;
    const term = ((-1) ** m * Math.pow(halfX, 2 * m + n)) / denom;
    sum += term;
    if (Math.abs(term) < 1e-10 && m > 5) break;
  }
  return sum;
}

// ============================================================
// Motor Web Audio FM (equivalente a PM para moduladores senoidales).
// modOsc → modGain → carrier.frequency  (deviation = I·f_m)
// ============================================================
export function useFMEngine() {
  const ref = useRef(null);
  const [analyserNode, setAnalyserNode] = useState(null);

  const api = useMemo(() => {
    function ensure() {
      if (ref.current) return ref.current;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 16384;
      analyser.smoothingTimeConstant = 0.78;
      carrier.type = 'sine';
      modulator.type = 'sine';
      carrier.frequency.value = 220;
      modulator.frequency.value = 220;
      modGain.gain.value = 0;
      masterGain.gain.value = 0;
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      // Analyser ANTES del masterGain → la visualización siempre ve la señal
      // aunque el bus de salida esté silenciado.
      carrier.connect(analyser);
      carrier.connect(masterGain);
      masterGain.connect(ctx.destination);
      carrier.start();
      modulator.start();
      ref.current = { ctx, carrier, modulator, modGain, masterGain, analyser };
      setAnalyserNode(analyser);
      return ref.current;
    }

    function setParams({ fc, ratio, I }) {
      const e = ensure();
      if (!e) return;
      const fm = fc * ratio;
      const t = e.ctx.currentTime;
      e.carrier.frequency.setTargetAtTime(fc, t, 0.02);
      e.modulator.frequency.setTargetAtTime(fm, t, 0.02);
      e.modGain.gain.setTargetAtTime(I * fm, t, 0.02);
    }

    function setRawParams({ fc, fm, I }) {
      const e = ensure();
      if (!e) return;
      const t = e.ctx.currentTime;
      e.carrier.frequency.setTargetAtTime(fc, t, 0.02);
      e.modulator.frequency.setTargetAtTime(fm, t, 0.02);
      e.modGain.gain.setTargetAtTime(I * fm, t, 0.02);
    }

    function play(level = 0.18) {
      const e = ensure();
      if (!e) return;
      if (e.ctx.state === 'suspended') e.ctx.resume();
      e.masterGain.gain.setTargetAtTime(level, e.ctx.currentTime, 0.04);
    }

    function stop() {
      if (!ref.current) return;
      const e = ref.current;
      e.masterGain.gain.setTargetAtTime(0, e.ctx.currentTime, 0.04);
    }

    function triggerPluck({ fc, ratio, I, duration = 1.6 }) {
      const e = ensure();
      if (!e) return;
      if (e.ctx.state === 'suspended') e.ctx.resume();
      const fm = fc * ratio;
      const now = e.ctx.currentTime;
      e.carrier.frequency.setTargetAtTime(fc, now, 0.005);
      e.modulator.frequency.setTargetAtTime(fm, now, 0.005);
      e.modGain.gain.cancelScheduledValues(now);
      e.modGain.gain.setTargetAtTime(I * fm, now, 0.005);
      e.masterGain.gain.cancelScheduledValues(now);
      e.masterGain.gain.setValueAtTime(0, now);
      e.masterGain.gain.linearRampToValueAtTime(0.22, now + 0.005);
      e.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    return { ensure, setParams, setRawParams, play, stop, triggerPluck };
  }, []);

  useEffect(() => () => {
    if (ref.current) {
      try { ref.current.ctx.close(); } catch { /* noop */ }
      ref.current = null;
    }
  }, []);

  return { ...api, analyser: analyserNode };
}

// ============================================================
// LiveSpectrum — barras FFT real-time sobre fondo cream
// ============================================================
export function LiveSpectrum({ analyser, accentColor = AMBER, height = 220, maxFreq = 3200 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!analyser) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx2d = canvas.getContext('2d');
    const bufferLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLen);
    let raf = 0;
    const sampleRate = analyser.context.sampleRate;
    const nyquist = sampleRate / 2;
    const maxBin = Math.min(bufferLen, Math.floor((maxFreq / nyquist) * bufferLen));

    function draw() {
      raf = requestAnimationFrame(draw);
      const { width: W, height: H } = canvas;
      analyser.getByteFrequencyData(data);
      ctx2d.fillStyle = CREAM;
      ctx2d.fillRect(0, 0, W, H);
      const BAR = 200;
      const binsPerBar = Math.max(1, Math.floor(maxBin / BAR));
      const barW = (W - 12) / BAR;
      for (let i = 0; i < BAR; i += 1) {
        let acc = 0;
        for (let j = 0; j < binsPerBar; j += 1) acc += data[i * binsPerBar + j] || 0;
        const avg = acc / binsPerBar / 255;
        const h = Math.pow(avg, 0.85) * (H - 36);
        const x = 6 + i * barW;
        ctx2d.fillStyle = accentColor;
        ctx2d.globalAlpha = 0.85;
        ctx2d.fillRect(x, H - 22 - h, Math.max(1, barW - 0.6), h);
      }
      ctx2d.globalAlpha = 1;
      ctx2d.strokeStyle = INK_FAINT;
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(6, H - 22);
      ctx2d.lineTo(W - 6, H - 22);
      ctx2d.stroke();
      ctx2d.fillStyle = INK_MUTED;
      ctx2d.font = '10px Inter, sans-serif';
      [0, 500, 1000, 2000, 3000].forEach((f) => {
        if (f > maxFreq) return;
        const x = 6 + (f / maxFreq) * (W - 12);
        ctx2d.fillRect(x, H - 22, 1, 4);
        ctx2d.fillText(`${f === 0 ? '0' : f >= 1000 ? `${f / 1000}k` : f} Hz`, x + 2, H - 8);
      });
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, accentColor, maxFreq]);

  return (
    <canvas ref={canvasRef} width={760} height={height}
      style={{ width: '100%', height, borderRadius: 10, background: CREAM,
               border: `1px solid ${INK_FAINT}`, display: 'block' }} />
  );
}

// ============================================================
// LiveWaveform — forma de onda real-time
// ============================================================
export function LiveWaveform({ analyser, accentColor = AMBER, height = 130, windowSamples = null, dark = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!analyser) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx2d = canvas.getContext('2d');
    const fullLen = analyser.fftSize;
    const bufLen = windowSamples ? Math.min(windowSamples, fullLen) : fullLen;
    const data = new Uint8Array(fullLen);
    let raf = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      const { width: W, height: H } = canvas;
      analyser.getByteTimeDomainData(data);
      ctx2d.fillStyle = dark ? '#08111d' : CREAM;
      ctx2d.fillRect(0, 0, W, H);
      ctx2d.strokeStyle = dark ? 'rgba(255,255,255,0.10)' : INK_FAINT;
      ctx2d.lineWidth = 0.6;
      ctx2d.beginPath();
      ctx2d.moveTo(0, H / 2); ctx2d.lineTo(W, H / 2); ctx2d.stroke();
      ctx2d.strokeStyle = accentColor;
      ctx2d.lineWidth = 1.4;
      ctx2d.beginPath();
      const stepSize = Math.max(1, Math.floor(bufLen / W));
      let drawn = 0;
      for (let i = 0; i < bufLen; i += stepSize) {
        const x = (i / bufLen) * W;
        const v = (data[i] - 128) / 128;
        const y = H / 2 - v * (H / 2 - 8);
        if (drawn === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);
        drawn += 1;
      }
      ctx2d.stroke();
      const sampleRate = analyser.context.sampleRate;
      const totalMs = (bufLen / sampleRate) * 1000;
      ctx2d.fillStyle = dark ? 'rgba(255,255,255,0.45)' : INK_MUTED;
      ctx2d.font = '10px Inter, sans-serif';
      ctx2d.fillText('0 ms', 4, H - 4);
      ctx2d.fillText(`${totalMs.toFixed(1)} ms`, W - 56, H - 4);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, accentColor, windowSamples, dark]);

  return (
    <canvas ref={canvasRef} width={760} height={height}
      style={{ width: '100%', height, borderRadius: 10,
               background: dark ? '#08111d' : CREAM,
               border: `1px solid ${dark ? '#2b3747' : INK_FAINT}`, display: 'block' }} />
  );
}

// ============================================================
// LabSpectrum — espectro en dB con grilla (estilo demo_fm)
// ============================================================
export function LabSpectrum({ analyser, accentColor = '#4ec3ff', height = 220, fmax = 4000, harmonicsF0 = null }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!analyser) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx2d = canvas.getContext('2d');
    const Nbins = analyser.frequencyBinCount;
    const data = new Float32Array(Nbins);
    let raf = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      const { width: W, height: H } = canvas;
      analyser.getFloatFrequencyData(data);
      ctx2d.fillStyle = '#08111d';
      ctx2d.fillRect(0, 0, W, H);
      const sr = analyser.context.sampleRate;
      const binHz = (sr / 2) / Nbins;
      const xMaxBin = Math.min(Nbins, Math.floor(fmax / binHz));
      ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx2d.fillStyle = 'rgba(255,255,255,0.45)';
      ctx2d.font = '10px JetBrains Mono, monospace';
      ctx2d.lineWidth = 1;
      for (let f = 0; f <= fmax; f += 500) {
        const x = (f / fmax) * W;
        ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, H); ctx2d.stroke();
        if (f > 0) ctx2d.fillText(`${f >= 1000 ? `${f / 1000}k` : f} Hz`, x + 3, H - 4);
      }
      for (let db = -20; db >= -60; db -= 20) {
        const y = H * (1 - (db + 80) / 80);
        ctx2d.beginPath(); ctx2d.moveTo(0, y); ctx2d.lineTo(W, y); ctx2d.stroke();
        ctx2d.fillText(`${db} dB`, 4, y - 3);
      }
      if (harmonicsF0) {
        ctx2d.strokeStyle = 'rgba(255,176,66,0.55)';
        ctx2d.lineWidth = 1;
        for (let k = 1; k * harmonicsF0 <= fmax; k += 1) {
          const x = (k * harmonicsF0 / fmax) * W;
          ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, H); ctx2d.stroke();
        }
      }
      ctx2d.strokeStyle = accentColor;
      ctx2d.fillStyle = `${accentColor}33`;
      ctx2d.lineWidth = 1.2;
      ctx2d.beginPath();
      ctx2d.moveTo(0, H);
      for (let i = 0; i < xMaxBin; i += 1) {
        const x = (i / xMaxBin) * W;
        const db = data[i];
        let y = H * (1 - (db + 80) / 80);
        y = Math.max(0, Math.min(H, y));
        ctx2d.lineTo(x, y);
      }
      ctx2d.lineTo(W, H);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.stroke();
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, accentColor, fmax, harmonicsF0]);

  return (
    <canvas ref={canvasRef} width={900} height={height}
      style={{ width: '100%', height, borderRadius: 10, background: '#08111d',
               border: `1px solid #2b3747`, display: 'block' }} />
  );
}

// ============================================================
// PlanoRatioIndice — el mapa 2D del timbre FM
// ============================================================
export function PlanoRatioIndice({ ratio, I, focus = null }) {
  const W = 460, H = 280;
  const xMin = 0.3, xMax = 3.4, yMax = 12;
  const xOf = (r) => ((r - xMin) / (xMax - xMin)) * (W - 70) + 56;
  const x = xOf(Math.min(Math.max(ratio, xMin), xMax));
  const y = H - 36 - (Math.min(Math.max(I, 0), yMax) / yMax) * (H - 70);

  const marks = [
    { r: 1.0, label: '1:1', kind: 'arm', desc: 'serrucho/órgano' },
    { r: 2.0, label: '1:2', kind: 'arm', desc: 'sólo impares' },
    { r: 3.0, label: '1:3', kind: 'arm', desc: 'metal cálido' },
    { r: Math.SQRT2, label: '1:√2', kind: 'inarm', desc: 'campana' },
    { r: 2.236, label: '1:√5', kind: 'inarm', desc: 'gong' },
    { r: Math.PI / 2, label: 'π/2', kind: 'inarm', desc: 'inarmónico' },
  ];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: CREAM, borderRadius: 10 }}>
      {[2, 4, 6, 8, 10].map((iy) => {
        const yy = H - 36 - (iy / yMax) * (H - 70);
        return (
          <g key={iy}>
            <line x1={56} y1={yy} x2={W - 14} y2={yy} stroke={INK_FAINT} strokeOpacity={0.18} strokeWidth={0.5} />
            <text x={50} y={yy + 3} textAnchor="end" fontFamily="JetBrains Mono,monospace" fontSize={9} fill={INK_FAINT}>{iy}</text>
          </g>
        );
      })}
      <line x1={56} y1={H - 36} x2={W - 14} y2={H - 36} stroke={INK_FAINT} strokeWidth={1} />
      <line x1={56} y1={20} x2={56} y2={H - 36} stroke={INK_FAINT} strokeWidth={1} />
      <text x={W - 14} y={H - 18} textAnchor="end" fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>Ratio f_m / f_c →</text>
      <text x={56} y={14} textAnchor="start" fontFamily="Inter,sans-serif" fontSize={10} fill={AMBER}>↑ Índice I  (cantidad de brillo)</text>
      {marks.map((m) => {
        const dimmed = focus && m.kind !== focus;
        const highlighted = focus === m.kind;
        const color = m.kind === 'arm' ? BLUE : RED;
        const opacity = dimmed ? 0.12 : highlighted ? 0.85 : 0.35;
        return (
          <g key={m.label} style={{ transition: 'opacity 0.4s ease' }}>
            <line x1={xOf(m.r)} y1={H - 36} x2={xOf(m.r)} y2={20} stroke={color}
              strokeOpacity={opacity * 0.6}
              strokeDasharray={highlighted ? '5 3' : '2 4'}
              strokeWidth={highlighted ? 1.6 : 1} />
            <circle cx={xOf(m.r)} cy={H - 36} r={highlighted ? 5 : 3} fill={color} fillOpacity={opacity} />
            <text x={xOf(m.r)} y={H - 22} textAnchor="middle" fontFamily="JetBrains Mono,monospace"
              fontSize={highlighted ? 11 : 10} fontWeight={highlighted ? 700 : 400}
              fill={color} fillOpacity={dimmed ? 0.3 : 1}>{m.label}</text>
            {highlighted && (
              <text x={xOf(m.r)} y={H - 7} textAnchor="middle" fontFamily="Inter,sans-serif"
                fontSize={9} fill={color} fontStyle="italic">{m.desc}</text>
            )}
          </g>
        );
      })}
      <circle cx={x} cy={y} r={11} fill={AMBER} fillOpacity={0.22} stroke={AMBER} strokeWidth={2.4} />
      <circle cx={x} cy={y} r={3} fill={AMBER} />
      <text x={x + 14} y={y + 4} fontFamily="JetBrains Mono,monospace" fontSize={11} fill={INK} fontWeight={700}>
        ratio={ratio.toFixed(2)} · I={I.toFixed(1)}
      </text>
      <g transform={`translate(${W - 220}, 26)`}>
        <rect x={0} y={0} width={10} height={10} fill={BLUE} opacity={focus === 'arm' ? 1 : 0.45} />
        <text x={14} y={9} fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>armónico (racional)</text>
        <rect x={108} y={0} width={10} height={10} fill={RED} opacity={focus === 'inarm' ? 1 : 0.45} />
        <text x={122} y={9} fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>inarmónico (irracional)</text>
      </g>
    </svg>
  );
}

// ============================================================
// BesselSpectrum — barras |J_n(I)| centradas en f_c
// ============================================================
export function BesselSpectrum({ fc, fm, I, highlightNull = false, height = 240 }) {
  const W = 540, H = height;
  const Nmax = Math.max(4, Math.min(22, Math.ceil(I + 3)));
  const bars = useMemo(() => {
    const out = [];
    for (let n = -Nmax; n <= Nmax; n += 1) {
      const f = fc + n * fm;
      const amp = besselJ(Math.abs(n), I);
      out.push({ n, f, amp: Math.abs(amp) });
    }
    return out;
  }, [fc, fm, I, Nmax]);
  const maxAmp = Math.max(...bars.map((b) => b.amp), 0.2);
  const usableW = W - 60;
  const totalBars = Nmax * 2 + 1;
  const slot = usableW / totalBars;
  const barW = Math.max(2, slot * 0.62);
  const xCenter = 30 + usableW / 2;
  const xOf = (n) => xCenter + n * slot;
  const baseline = H - 40;
  const bandsCount = Math.round(I) + 1;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: CREAM, borderRadius: 10 }}>
      <line x1={20} y1={baseline} x2={W - 20} y2={baseline} stroke={INK_FAINT} strokeWidth={1} />
      <text x={W - 22} y={H - 14} textAnchor="end" fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>f_c ± n·f_m</text>
      <text x={22} y={16} fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>|J_n(I)|</text>
      <g transform={`translate(${W - 220}, 22)`}>
        <rect x={0} y={0} width={200} height={22} rx={11} fill={AMBER} fillOpacity={0.16} stroke={AMBER} strokeWidth={1} />
        <text x={100} y={15} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={10.5} fill={AMBER} fontWeight={700}>
          ≈ {bandsCount} bandas audibles  (I + 1)
        </text>
      </g>
      {bars.map((b) => {
        const h = (b.amp / maxAmp) * (H - 90);
        const isCarrier = b.n === 0;
        let color;
        if (isCarrier) color = highlightNull ? INK_FAINT : BLUE;
        else if (Math.abs(b.n) <= 2) color = AMBER;
        else if (Math.abs(b.n) <= 5) color = '#e08c20';
        else color = RED;
        const x = xOf(b.n) - barW / 2;
        const drawHeight = highlightNull && isCarrier ? 0 : h;
        return (
          <g key={b.n}>
            <rect x={x} y={baseline - drawHeight} width={barW} height={drawHeight}
              fill={color} fillOpacity={isCarrier ? 0.95 : 0.78} rx={1}
              style={{ transition: 'height 0.3s ease, y 0.3s ease' }} />
            {Math.abs(b.n) <= 6 && totalBars <= 23 && (
              <text x={xOf(b.n)} y={H - 22} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={9} fill={INK_FAINT}>
                {b.n === 0 ? 'f_c' : (b.n > 0 ? `+${b.n}` : `${b.n}`)}
              </text>
            )}
          </g>
        );
      })}
      {highlightNull && (
        <g>
          <line x1={xCenter} y1={28} x2={xCenter} y2={baseline} stroke={AMBER} strokeWidth={1.5} strokeDasharray="4 3" />
          <rect x={xCenter - 90} y={50} width={180} height={36} rx={6} fill="#fffbf2" stroke={AMBER} strokeWidth={1.2} />
          <text x={xCenter} y={66} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize={11} fill={AMBER} fontWeight={700}>
            J₀(2.4048) ≈ 0
          </text>
          <text x={xCenter} y={80} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED} fontStyle="italic">
            la portadora desaparece
          </text>
        </g>
      )}
      <g transform={`translate(22, ${H - 32})`}>
        <text fontFamily="JetBrains Mono,monospace" fontSize={11} fill={AMBER} fontWeight={700}>
          I = {I.toFixed(2)}
        </text>
      </g>
    </svg>
  );
}

// ============================================================
// BesselChart — curvas J_0..J_6 vs I
// ============================================================
export function BesselChart({ I, highlightNull = false }) {
  const W = 460, H = 220;
  const xMax = 12, yMin = -0.45, yMax = 1.05;
  const xToPx = (x) => 40 + (x / xMax) * (W - 60);
  const yToPx = (y) => H - 26 - ((y - yMin) / (yMax - yMin)) * (H - 50);
  const colors = [BLUE, RED, AMBER, VIOLET, GREEN, '#0ea5e9', INK_MUTED];
  const curves = useMemo(() => {
    const N = 6;
    const samples = 240;
    return Array.from({ length: N + 1 }, (_, n) => {
      let path = '';
      for (let i = 0; i <= samples; i += 1) {
        const x = (i / samples) * xMax;
        const y = besselJ(n, x);
        path += `${i === 0 ? 'M' : 'L'}${xToPx(x).toFixed(2)},${yToPx(y).toFixed(2)} `;
      }
      return { n, path, color: colors[n] };
    });
  }, []);
  const cursorX = xToPx(Math.min(Math.max(I, 0), xMax));
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: CREAM, borderRadius: 10 }}>
      <line x1={40} y1={yToPx(0)} x2={W - 20} y2={yToPx(0)} stroke={INK_FAINT} strokeWidth={1} />
      <line x1={40} y1={H - 26} x2={W - 20} y2={H - 26} stroke={INK_FAINT} strokeWidth={1} />
      <text x={W - 20} y={H - 12} textAnchor="end" fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>Índice I</text>
      <text x={42} y={16} fontFamily="Inter,sans-serif" fontSize={10} fill={INK_MUTED}>J_n(I)</text>
      {highlightNull && (
        <g>
          <line x1={xToPx(2.4048)} y1={20} x2={xToPx(2.4048)} y2={H - 26} stroke={AMBER} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={xToPx(2.4048) + 4} y={28} fontFamily="JetBrains Mono,monospace" fontSize={10} fill={AMBER}>J₀(2.4048)≈0</text>
        </g>
      )}
      {curves.map(({ n, path, color }) => (
        <path key={n} d={path} fill="none" stroke={color}
          strokeWidth={n === 0 ? 2.4 : 1.4} opacity={n === 0 ? 1 : 0.75} />
      ))}
      <line x1={cursorX} y1={20} x2={cursorX} y2={H - 26} stroke={INK} strokeOpacity={0.35} strokeWidth={1} />
      <g transform={`translate(${W - 110}, 24)`}>
        {curves.map(({ n, color }, i) => (
          <g key={n} transform={`translate(0, ${i * 12})`}>
            <line x1={0} y1={5} x2={14} y2={5} stroke={color} strokeWidth={2} />
            <text x={18} y={8} fontFamily="JetBrains Mono,monospace" fontSize={9} fill={INK_MUTED}>J_{n}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ============================================================
// PillButton — botón pill canónico
// ============================================================
export function PillButton({ children, onClick, color = BLUE, kind = 'solid', disabled = false }) {
  const bg = kind === 'solid' ? color : 'transparent';
  const fg = kind === 'solid' ? '#fff' : color;
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        padding: '10px 22px', borderRadius: 50, border: `2px solid ${color}`,
        background: bg, color: fg, fontFamily: "'Inter', sans-serif",
        fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'background 0.15s ease, color 0.15s ease',
      }}>
      {children}
    </button>
  );
}

// ============================================================
// Slider con etiqueta
// ============================================================
export function Slider({ label, value, min, max, step, onChange, color = INK, format = (v) => v.toFixed(2), unit = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color, fontWeight: 700 }}>{format(value)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  );
}

// ============================================================
// SubStepTabs — botones internos para revelar sub-pasos
// (única navegación permitida dentro de una slide)
// ============================================================
export function SubStepTabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {items.map((it, i) => {
        const active = value === i;
        return (
          <button key={i} type="button" onClick={() => onChange(i)}
            style={{
              padding: '7px 16px', borderRadius: 50,
              border: `1.5px solid ${active ? it.color : INK_FAINT}`,
              background: active ? it.color : 'transparent',
              color: active ? '#fff' : INK_MUTED,
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
              letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 8, opacity: 0.85 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// RevealButton — botón único para "revelar siguiente paso interno"
// (úsalo cuando la slide tiene una progresión lineal sin tabs)
// ============================================================
export function RevealButton({ step, total, onAdvance, onReset, labels }) {
  const atEnd = step >= total - 1;
  if (atEnd) {
    return (
      <PillButton kind="outline" color={INK_MUTED} onClick={onReset}>
        ↻ Reiniciar revelado
      </PillButton>
    );
  }
  const label = labels && labels[step] ? labels[step] : 'Revelar siguiente';
  return (
    <PillButton color={AMBER} onClick={onAdvance}>
      {label} →
    </PillButton>
  );
}

// ============================================================
// NarrativeBlock — bloque de texto teórico breve
// ============================================================
export function NarrativeBlock({ kicker, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {kicker && (
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
          {kicker}
        </span>
      )}
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: 16, lineHeight: 1.5, color: INK }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// useFMAutoSetup — pequeño helper que inicializa el AudioContext
// y silencia al desmontar. Útil para slides interactivas.
// ============================================================
export function useFMAutoSetup(engine, deps = []) {
  const { ensure, stop } = engine;
  useEffect(() => {
    ensure();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ============================================================
// Detector de proximidad a un racional p/q con q ≤ 6
// ============================================================
export function detectRational(r) {
  const tol = 0.005;
  for (let q = 1; q <= 6; q += 1) {
    for (let p = 1; p <= 6 * q; p += 1) {
      if (Math.abs(r - p / q) < tol) return [p, q];
    }
  }
  return null;
}

export const RATIO_PRESETS = [
  { label: '1:1',   ratio: 1.0 },
  { label: '1:2',   ratio: 2.0 },
  { label: '1:3',   ratio: 3.0 },
  { label: '2:1',   ratio: 0.5 },
  { label: '1:√2',  ratio: 1.41421356 },
  { label: '1:π',   ratio: Math.PI },
  { label: '1:3.5', ratio: 3.5 },
  { label: '1:φ',   ratio: 1.61803399 },
];

export function RatioPresetButton({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        padding: '7px 12px', borderRadius: 6,
        border: `1px solid ${active ? VIOLET : '#2b3747'}`,
        background: active ? VIOLET : '#18243a',
        color: active ? '#fff' : '#e8edf2',
        fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}>
      {label}
    </button>
  );
}

// Hook callback-friendly para combinar play + setParams
export function useFMPlayback(engine) {
  const { ensure, setParams, setRawParams, play, stop } = engine;
  return useCallback((mode, params) => {
    ensure();
    if (mode === 'raw') setRawParams(params);
    else setParams(params);
    play();
  }, [ensure, setParams, setRawParams, play, stop]);
}

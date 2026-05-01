/**
 * RecorderContext (LiveVoiceContext.jsx)
 * ======================================
 * Provider genérico para grabar audio del micrófono y subirlo al backend.
 * Sin acoplamiento a un dominio específico (no asume SMS, filtros, etc.).
 *
 * Endpoint contractual:
 *   POST {BACKEND_URL}/api/upload   → { session_id, input }
 *
 * Después de subir, los slides pueden disparar pipelines DSP con:
 *   POST {BACKEND_URL}/api/run/{pipeline_id}/{session_id}
 *
 * API expuesta vía useRecorder():
 *   recording   : boolean
 *   seconds     : number  (segundos transcurridos en la grabación actual)
 *   sessionId   : string | null
 *   start()     : Promise<void>
 *   stop()      : Promise<{ session_id }>  (devuelve la respuesta del backend)
 *   reset()     : void
 *   error       : string | null
 *
 * Mantiene el alias `LiveVoiceProvider` / `useLiveVoice` para retro-compat.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8765';

const DEFAULT_MAX_SEC = 10;
const DEFAULT_MIN_SEC = 1;
const DEFAULT_SAMPLE_RATE = 44100;

const RecorderContext = createContext(null);

export function useRecorder() {
  const ctx = useContext(RecorderContext);
  if (!ctx) throw new Error('useRecorder debe usarse dentro de RecorderProvider');
  return ctx;
}

// Codifica AudioBuffer → Blob WAV PCM-16 mono.
function audioBufferToWavBlob(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const mono = new Float32Array(length);
  if (audioBuffer.numberOfChannels === 1) {
    mono.set(audioBuffer.getChannelData(0));
  } else {
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.getChannelData(1);
    for (let i = 0; i < length; i++) mono[i] = 0.5 * (ch0[i] + ch1[i]);
  }
  const blockAlign = 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (o, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < length; i++) {
    let s = Math.max(-1, Math.min(1, mono[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(off, s, true);
    off += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export function RecorderProvider({ children, options = {} }) {
  const {
    maxSeconds = DEFAULT_MAX_SEC,
    minSeconds = DEFAULT_MIN_SEC,
    targetSampleRate = DEFAULT_SAMPLE_RATE,
    backendUrl = BACKEND_URL,
  } = options;

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const stopResolverRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const start = useCallback(async () => {
    if (recording) return;
    setError(null);
    setSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const rec = new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start();
      setRecording(true);
      const t0 = performance.now();
      timerRef.current = setInterval(() => {
        const s = (performance.now() - t0) / 1000;
        setSeconds(s);
        if (s >= maxSeconds) stop();
      }, 100);
    } catch (e) {
      setError(e?.message ?? String(e));
      cleanup();
    }
  }, [recording, maxSeconds, cleanup]);

  const stop = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const rec = mediaRecorderRef.current;
      if (!rec || rec.state === 'inactive') {
        cleanup();
        setRecording(false);
        return resolve(null);
      }
      stopResolverRef.current = { resolve, reject };
      rec.onstop = async () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        try {
          if (seconds < minSeconds) {
            cleanup();
            setRecording(false);
            throw new Error(`Grabación demasiado corta (< ${minSeconds}s)`);
          }
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const arrayBuf = await blob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: targetSampleRate,
          });
          const decoded = await audioCtx.decodeAudioData(arrayBuf);
          const wav = audioBufferToWavBlob(decoded);
          await audioCtx.close();
          cleanup();
          setRecording(false);

          const fd = new FormData();
          fd.append('file', wav, 'recording.wav');
          const res = await fetch(`${backendUrl}/api/upload`, { method: 'POST', body: fd });
          if (!res.ok) throw new Error(`upload falló: ${res.status}`);
          const data = await res.json();
          setSessionId(data.session_id);
          resolve(data);
        } catch (e) {
          setError(e?.message ?? String(e));
          reject(e);
        }
      };
      rec.stop();
    });
  }, [seconds, minSeconds, targetSampleRate, backendUrl, cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setRecording(false);
    setSeconds(0);
    setSessionId(null);
    setError(null);
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  const value = {
    recording, seconds, sessionId, error,
    start, stop, reset,
    backendUrl,
  };
  return <RecorderContext.Provider value={value}>{children}</RecorderContext.Provider>;
}

// ─── Aliases retro-compatibles ─────────────────────────────────────────
export const LiveVoiceProvider = RecorderProvider;
export const useLiveVoice = useRecorder;

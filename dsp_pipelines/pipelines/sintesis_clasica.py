"""
sintesis_clasica.py
===================
Demos pedagógicos: síntesis aditiva, wavetable (lectura de ciclo) y sustractiva
(fuente rica + filtro IIR vía scipy.signal).

El contrato exige `input_wav`; para esta clase se ignora (entrada dummy).

Registrado en course_config como `pipelines.sintesis_clasica` (nombre de módulo
Python válido; la slide conserva id `sintesis-clasica`).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import soundfile as sf
from scipy import signal


def _normalize_peak_dbfs(x: np.ndarray, dbfs: float = -1.0) -> np.ndarray:
    peak = float(np.max(np.abs(x)) + 1e-12)
    return (x / peak * (10 ** (dbfs / 20))).astype(np.float32)


def _fade_edges(x: np.ndarray, fade_samples: int) -> np.ndarray:
    n = len(x)
    f = min(max(1, fade_samples), n // 4)
    env = np.ones(n, dtype=np.float64)
    env[:f] *= np.linspace(0.0, 1.0, f, endpoint=True)
    env[-f:] *= np.linspace(1.0, 0.0, f, endpoint=True)
    return (x.astype(np.float64) * env).astype(np.float32)


def run(input_wav: Path, out_dir: Path, **params: Any) -> dict[str, Any]:
    _ = input_wav  # contrato; no usado (síntesis desde cero)

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    sr = int(params.get("sr", 44100))
    duration_s = float(params.get("duration_s", 2.5))
    f0 = float(params.get("f0", 220.0))
    n_harmonics = int(params.get("n_harmonics", 8))
    wavetable_size = int(params.get("wavetable_size", 2048))
    cutoff_hz = float(params.get("cutoff_hz", 1800.0))
    filter_order = int(params.get("filter_order", 4))

    n = int(sr * duration_s)
    t = np.arange(n, dtype=np.float64) / sr

    # --- Aditiva: armónicos 1..K con peso 1/k ---
    amps = np.array([1.0 / k for k in range(1, n_harmonics + 1)], dtype=np.float64)
    amps /= np.sum(amps)
    y_add = np.zeros(n, dtype=np.float64)
    for k in range(1, n_harmonics + 1):
        y_add += amps[k - 1] * np.sin(2 * np.pi * k * f0 * t)
    y_add = _fade_edges(y_add.astype(np.float32), int(0.02 * sr))
    y_add = _normalize_peak_dbfs(y_add)

    # --- Wavetable: un ciclo tipo sierra por suma de senos, lectura lineal ---
    phase = np.linspace(0, 2 * np.pi, wavetable_size, endpoint=False)
    w = np.zeros(wavetable_size, dtype=np.float64)
    max_h_table = min(64, max(1, int(0.45 * sr / max(f0, 1e-3))))
    for k in range(1, max_h_table + 1):
        w += (2.0 / (np.pi * k)) * ((-1) ** (k + 1)) * np.sin(k * phase)
    w = w / (np.max(np.abs(w)) + 1e-12)
    inc = f0 / sr * wavetable_size
    idx = (np.arange(n, dtype=np.float64) * inc) % wavetable_size
    i0 = np.floor(idx).astype(np.int64) % wavetable_size
    i1 = (i0 + 1) % wavetable_size
    frac = (idx - np.floor(idx)).astype(np.float64)
    y_wt = ((1.0 - frac) * w[i0] + frac * w[i1]).astype(np.float64)
    y_wt = _fade_edges(y_wt.astype(np.float32), int(0.02 * sr))
    y_wt = _normalize_peak_dbfs(y_wt)

    # --- Sustractiva: sierra (armónicos) + paso bajo Butterworth ---
    max_h_saw = min(48, max(1, int(0.45 * sr / max(f0, 1e-3))))
    saw = np.zeros(n, dtype=np.float64)
    for k in range(1, max_h_saw + 1):
        saw += (2.0 / (np.pi * k)) * np.sin(2 * np.pi * k * f0 * t)
    saw = saw / (np.max(np.abs(saw)) + 1e-12)
    sos = signal.butter(filter_order, cutoff_hz, btype="low", fs=sr, output="sos")
    y_sub = signal.sosfilt(sos, saw).astype(np.float64)
    y_sub = _fade_edges(y_sub.astype(np.float32), int(0.02 * sr))
    y_sub = _normalize_peak_dbfs(y_sub)

    names = (
        "sintesis_clasica_aditiva.wav",
        "sintesis_clasica_wavetable.wav",
        "sintesis_clasica_sustractiva.wav",
    )
    sf.write(str(out_dir / names[0]), y_add, sr, subtype="PCM_16")
    sf.write(str(out_dir / names[1]), y_wt, sr, subtype="PCM_16")
    sf.write(str(out_dir / names[2]), y_sub, sr, subtype="PCM_16")

    # --- Figuras pedagógicas (cream, paleta canónica) ---
    freqs = f0 * np.arange(1, n_harmonics + 1)
    fig, ax = plt.subplots(figsize=(12, 4.2), dpi=100, facecolor="#faf8f3")
    ax.bar(freqs, amps, width=np.minimum(freqs * 0.12, f0 * 0.45), color="#2563eb", edgecolor="#1a1a2e", linewidth=0.5)
    ax.axvline(f0, color="#7c3aed", linestyle="--", linewidth=1.0, label="$f_0$")
    ax.set_xlabel("f (Hz)")
    ax.set_ylabel("Amplitud rel.")
    ax.set_facecolor("#faf8f3")
    ax.grid(alpha=0.2)
    ax.legend(loc="upper right", frameon=False, fontsize=9)
    fig.tight_layout()
    harm_png = out_dir / "sintesis_clasica_harmonics.png"
    fig.savefig(str(harm_png), dpi=100, facecolor="#faf8f3")
    plt.close(fig)

    wv, h = signal.sosfreqz(sos, worN=2048, fs=sr)
    fig2, ax2 = plt.subplots(figsize=(12, 4.2), dpi=100, facecolor="#faf8f3")
    ax2.plot(wv, 20 * np.log10(np.abs(h) + 1e-12), color="#2563eb", linewidth=1.2)
    ax2.axvline(cutoff_hz, color="#c0392b", linestyle="--", linewidth=1.0)
    ax2.set_xlim(0, min(8000.0, sr / 2))
    ax2.set_ylim(-55, 5)
    ax2.set_xlabel("f (Hz)")
    ax2.set_ylabel("Magnitud (dB)")
    ax2.set_facecolor("#faf8f3")
    ax2.grid(alpha=0.2)
    fig2.tight_layout()
    filt_png = out_dir / "sintesis_clasica_filter.png"
    fig2.savefig(str(filt_png), dpi=100, facecolor="#faf8f3")
    plt.close(fig2)

    return {
        "audio": {names[0]: out_dir / names[0], names[1]: out_dir / names[1], names[2]: out_dir / names[2]},
        "images": {harm_png.name: harm_png, filt_png.name: filt_png},
        "meta": {
            "sr": sr,
            "samples": n,
            "f0": f0,
            "n_harmonics": n_harmonics,
            "wavetable_size": wavetable_size,
            "cutoff_hz": cutoff_hz,
            "filter_order": filter_order,
            "params": params,
        },
    }

"""
recreando_80s.py
================
Pipeline de la slide "Fun Task 09 · Recreando los 80s".

Doble objetivo:
  (1) Síntesis: clonar un timbre clásico de los 80 (bajo/brass) usando síntesis
      FM 2-operador (Chowning) con envolvente dinámica sobre el índice de
      modulación I(t) = I_max · ADSR(t).
  (2) Diagnóstico: leer original_80s.wav (snippet de referencia) y producir
      espectrogramas comparativos PNG → permite validar visualmente si el
      ratio f_m/f_c es el correcto.

Contrato (ver .claude/rules/python-dsp-base.md):
    run(input_wav: Path, out_dir: Path, **params) -> PipelineResult

Convención de I/O:
    input_wav  → dsp_pipelines/inputs/original_80s.wav
                 (si el archivo no existe se genera una referencia sintética
                  objetivo para que el pipeline corra end-to-end).
    outputs   → cover_80s.wav,
                 recreando_80s_spec_original.png,
                 recreando_80s_spec_cover.png,
                 recreando_80s_spec_compare.png
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


# === Paleta canónica del curso (mantener consistencia visual con el frontend) ===
CREAM = "#faf8f3"
INK = "#1a1a2e"
INK_MUTED = "#6b6b8a"
BLUE = "#2563eb"
RED = "#c0392b"
AMBER = "#d97706"


# ============================================================
# 1. Helpers · envolvente y máster
# ============================================================

def adsr(
    t: np.ndarray,
    A: float = 0.005,
    D: float = 0.35,
    S: float = 0.55,
    R: float = 0.6,
    sustain_time: float | None = None,
) -> np.ndarray:
    """Envolvente ADSR con caída exponencial en D y R.

    Devuelve un array del mismo largo que `t`, con valores en [0, 1].
    Si `sustain_time` es None, el sustain ocupa todo lo que sobre entre
    el final del decay y el inicio del release.
    """
    n = len(t)
    dur = float(t[-1] - t[0]) if n > 1 else 0.0
    if sustain_time is None:
        sustain_time = max(0.0, dur - (A + D + R))

    env = np.zeros(n, dtype=np.float64)
    # Ataque lineal 0 → 1
    i_a = int(round(A / dur * n)) if dur > 0 else 0
    if i_a > 0:
        env[:i_a] = np.linspace(0.0, 1.0, i_a, endpoint=False)

    # Decaimiento exponencial 1 → S
    i_d = int(round((A + D) / dur * n)) if dur > 0 else i_a
    if i_d > i_a:
        # exp(-k·τ) con τ ∈ [0,1]; constante elegida para que en τ=1 lleguemos a S
        k = -np.log(max(S, 1e-3))
        tau = np.linspace(0.0, 1.0, i_d - i_a, endpoint=False)
        env[i_a:i_d] = np.exp(-k * tau)

    # Sustain plano
    i_s = int(round((A + D + sustain_time) / dur * n)) if dur > 0 else i_d
    if i_s > i_d:
        env[i_d:i_s] = S

    # Release exponencial S → 0
    if n > i_s:
        tau = np.linspace(0.0, 1.0, n - i_s, endpoint=True)
        env[i_s:] = S * np.exp(-5.0 * tau)

    return env


def fm(
    t: np.ndarray,
    fc: float,
    ratio: float,
    I_t: np.ndarray,
    A_t: np.ndarray,
) -> np.ndarray:
    """Ecuación de Chowning · FM 2-operador.

    y(t) = A(t) · sin(2π f_c t + I(t) · sin(2π f_m t))
    con f_m = ratio · f_c.

    [WHY] La envolvente sobre I (I_sweep en el desafío) hace que el espectro
    "florezca" en el ataque: cuando I es grande, J_n(I) reparte mucha energía
    a las bandas laterales (sonido brillante e inarmónico-percibido). A medida
    que I cae, J_0(I) crece y la energía vuelve a la portadora — el timbre se
    "limpia" hacia un seno casi puro. Es exactamente la transferencia modal
    que ocurre cuando golpeás un piano: el ataque metálico decae al modo
    fundamental.
    """
    fm_freq = fc * ratio
    phase = 2 * np.pi * fc * t + I_t * np.sin(2 * np.pi * fm_freq * t)
    return A_t * np.sin(phase)


def normalize_peak_dbfs(x: np.ndarray, dbfs: float = -1.4) -> np.ndarray:
    """Normaliza al pico indicado (default −1.4 dBFS para evitar clipping)."""
    peak = float(np.max(np.abs(x)) + 1e-12)
    return (x / peak * (10 ** (dbfs / 20))).astype(np.float32)


# ============================================================
# 2. Helpers · análisis espectral (estilo plot_spec del Desafío Relámpago)
# ============================================================

def compute_stft_db(
    x: np.ndarray,
    sr: int,
    n_fft: int = 2048,
    hop: int = 512,
    fmax_hz: float = 3000.0,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """STFT → magnitud en dB, recortada a [0, fmax_hz]."""
    f, t_axis, Z = signal.stft(
        x.astype(np.float64),
        fs=sr,
        nperseg=n_fft,
        noverlap=n_fft - hop,
        window="hann",
        boundary=None,
        padded=False,
    )
    mag = np.abs(Z)
    # dB con piso a -90 dB
    mag_db = 20.0 * np.log10(mag + 1e-6)
    mag_db = np.clip(mag_db, -90.0, 0.0)
    fmask = f <= fmax_hz
    return f[fmask], t_axis, mag_db[fmask]


def plot_spec(
    ax,
    x: np.ndarray,
    sr: int,
    title: str,
    accent: str,
    n_fft: int = 2048,
    hop: int = 512,
    fmax_hz: float = 3000.0,
) -> None:
    """Dibuja un espectrograma de magnitud en `ax` con estética del curso."""
    f, t_axis, mag_db = compute_stft_db(x, sr, n_fft=n_fft, hop=hop, fmax_hz=fmax_hz)
    # Colormap monocromático tirando hacia el accent (cream-friendly)
    im = ax.pcolormesh(
        t_axis,
        f,
        mag_db,
        shading="auto",
        cmap="magma",
        vmin=-70.0,
        vmax=0.0,
    )
    ax.set_facecolor("#0d0d1c")
    ax.set_xlabel("t (s)", color=INK_MUTED, fontsize=9)
    ax.set_ylabel("f (Hz)", color=INK_MUTED, fontsize=9)
    ax.set_title(title, color=accent, fontsize=11, fontweight="bold", loc="left", pad=6)
    ax.tick_params(colors=INK_MUTED, labelsize=8)
    for spine in ax.spines.values():
        spine.set_color(INK_MUTED)
        spine.set_linewidth(0.5)
    return im


# ============================================================
# 3. Generación del original sintético (fallback si no hay snippet real)
# ============================================================

def synthesize_target_reference(sr: int, dur: float, fc: float) -> np.ndarray:
    """Genera una "referencia" objetivo con un
    ratio LIGERAMENTE distinto al cover. Esto permite que el espectrograma
    comparativo muestre el desplazamiento de bandas característico de un
    error de ratio — útil para enseñar el diagnóstico.

    [WHY] No usamos el mismo ratio que el cover porque entonces los dos
    espectrogramas serían idénticos y la lección visual sería nula.
    """
    t = np.arange(int(sr * dur), dtype=np.float64) / sr
    I_t = 5.5 * adsr(t, A=0.008, D=0.30, S=0.50, R=0.55)
    A_t = adsr(t, A=0.008, D=0.20, S=0.85, R=0.50)
    y = fm(t, fc=fc, ratio=1.07, I_t=I_t, A_t=A_t)  # ratio levemente desafinado
    return normalize_peak_dbfs(y, dbfs=-1.5)

def synthesize_melody(sr: int, fc_base: float, params: dict) -> np.ndarray:
    """Genera una melodía de bajo estilo 80s usando los mismos parámetros FM."""
    notes = [
        (fc_base, 0.25),         # D2
        (fc_base * 2, 0.25),     # D3 (octava)
        (0, 0.125),              # Silencio
        (fc_base * 1.498, 0.25), # A2 (quinta)
        (fc_base * 1.498, 0.25), # A2
        (0, 0.125),              # Silencio
        (fc_base * 1.781, 0.25), # C3 (séptima menor)
        (fc_base, 0.5),          # D2 (larga)
    ]
    
    y_L_all = []
    y_R_all = []
    
    ratio = float(params.get("ratio", 1.0))
    I_max = float(params.get("I_max", 6.5))
    detune_hz = float(params.get("detune_hz", 0.5))
    A_env = float(params.get("attack_s", 0.005))
    D_env = float(params.get("decay_s", 0.35))
    S_env = float(params.get("sustain", 0.55))
    R_env = float(params.get("release_s", 0.6))
    single_note_time = float(params.get("duration_s", 1.4))

    total_time = sum(dur for f, dur in notes)
    out_length = int(sr * (total_time + single_note_time))
    
    y_L_out = np.zeros(out_length, dtype=np.float64)
    y_R_out = np.zeros(out_length, dtype=np.float64)
    
    current_time = 0.0
    for freq, duration in notes:
        if freq > 0:
            n_note = int(sr * single_note_time)
            t = np.arange(n_note, dtype=np.float64) / sr
            
            # Usamos la misma envolvente del parámetro global para clonar el timbre idéntico
            I_t = I_max * adsr(t, A=A_env, D=D_env, S=S_env, R=R_env)
            A_t = adsr(t, A=A_env, D=0.20, S=0.85, R=0.50)
            
            y_L_note = fm(t, fc=freq - detune_hz, ratio=ratio, I_t=I_t, A_t=A_t)
            y_R_note = fm(t, fc=freq + detune_hz, ratio=ratio, I_t=I_t, A_t=A_t)
            
            start_idx = int(sr * current_time)
            y_L_out[start_idx:start_idx+n_note] += y_L_note
            y_R_out[start_idx:start_idx+n_note] += y_R_note
            
        current_time += duration
        
    trim_idx = int(sr * (total_time + 1.0))
    y_L_out = y_L_out[:trim_idx]
    y_R_out = y_R_out[:trim_idx]
        
    melody_stereo = np.stack([y_L_out, y_R_out], axis=1)
    return normalize_peak_dbfs(melody_stereo, dbfs=-1.4)


# ============================================================
# 4. Pipeline principal
# ============================================================

def run(input_wav: Path, out_dir: Path, **params: Any) -> dict[str, Any]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    sr = int(params.get("sr", 44100))
    dur = float(params.get("duration_s", 1.4))
    fc = float(params.get("fc", 73.4))           # D2 — bajo
    ratio = float(params.get("ratio", 1.0))      # armónico (bajo / brass)
    I_max = float(params.get("I_max", 6.5))
    detune_hz = float(params.get("detune_hz", 0.5))
    master_dbfs = float(params.get("master_dbfs", -1.4))
    A_env = float(params.get("attack_s", 0.005))
    D_env = float(params.get("decay_s", 0.35))
    S_env = float(params.get("sustain", 0.55))
    R_env = float(params.get("release_s", 0.6))

    # ============================================================
    # 4a. Síntesis del cover (estéreo con detune ±detune_hz)
    # ============================================================
    n = int(sr * dur)
    t = np.arange(n, dtype=np.float64) / sr

    # Envolvente sobre I — la firma "viva" del FM
    I_t = I_max * adsr(t, A=A_env, D=D_env, S=S_env, R=R_env)
    # Envolvente de amplitud — ligeramente más lenta para no cortar la cola
    A_t = adsr(t, A=A_env, D=0.20, S=0.85, R=0.50)

    # Canal L: fc - detune;  Canal R: fc + detune  → anchura espacial sin desafinar
    # [WHY] El oído promedia ambos canales tonalmente pero percibe la pequeña
    # diferencia de fase como "amplitud estéreo" (chorus mínimo).
    y_L = fm(t, fc=fc - detune_hz, ratio=ratio, I_t=I_t, A_t=A_t)
    y_R = fm(t, fc=fc + detune_hz, ratio=ratio, I_t=I_t, A_t=A_t)

    # Máster por canal (mantenemos coherencia de balance L/R)
    peak = max(float(np.max(np.abs(y_L))), float(np.max(np.abs(y_R))), 1e-12)
    gain = (10 ** (master_dbfs / 20)) / peak
    y_L = (y_L * gain).astype(np.float32)
    y_R = (y_R * gain).astype(np.float32)
    cover_stereo = np.stack([y_L, y_R], axis=1)

    cover_path = out_dir / "cover_80s.wav"
    sf.write(str(cover_path), cover_stereo, sr, subtype="PCM_16")

    melody_stereo = synthesize_melody(sr, fc, params)
    melody_path = out_dir / "cover_80s_melody.wav"
    sf.write(str(melody_path), melody_stereo, sr, subtype="PCM_16")

    # ============================================================
    # 4b. Original: si existe el snippet, lo usamos; si no, fallback sintético
    # ============================================================
    input_wav = Path(input_wav)
    if input_wav.exists() and input_wav.name.lower() != "dummy_silence.wav":
        x_orig, sr_orig = sf.read(str(input_wav), always_2d=False)
        if x_orig.ndim > 1:
            x_orig = x_orig.mean(axis=1)
        x_orig = x_orig.astype(np.float32)
        # Resample naïve si el snippet vino con otro sr (interp lineal)
        if sr_orig != sr:
            t_old = np.arange(len(x_orig)) / sr_orig
            t_new = np.arange(int(len(x_orig) * sr / sr_orig)) / sr
            x_orig = np.interp(t_new, t_old, x_orig).astype(np.float32)
        is_external_original = True
    else:
        x_orig = synthesize_target_reference(sr, dur, fc=fc)
        is_external_original = False

    # Para análisis siempre comparamos versiones MONO de la misma duración
    cover_mono = ((y_L + y_R) * 0.5).astype(np.float32)
    n_cmp = min(len(x_orig), len(cover_mono))
    x_orig_cmp = x_orig[:n_cmp]
    cover_cmp = cover_mono[:n_cmp]

    # ============================================================
    # 4c. Espectrogramas — paneles individuales + comparativo combinado
    # ============================================================
    fmax_view = float(params.get("fmax_view_hz", 3000.0))

    # Panel original (1 figura)
    fig1, ax1 = plt.subplots(figsize=(8, 3.6), dpi=110, facecolor=CREAM)
    plot_spec(
        ax1, x_orig_cmp, sr,
        title=("Espectrograma · Original (externo)"
               if is_external_original else
               "Espectrograma · Sonido Objetivo a Clonar"),
        accent=BLUE, fmax_hz=fmax_view,
    )
    fig1.tight_layout()
    spec_orig_path = out_dir / "recreando_80s_spec_original.png"
    fig1.savefig(str(spec_orig_path), dpi=110, facecolor=CREAM)
    plt.close(fig1)

    # Panel cover (1 figura)
    fig2, ax2 = plt.subplots(figsize=(8, 3.6), dpi=110, facecolor=CREAM)
    plot_spec(
        ax2, cover_cmp, sr,
        title="Espectrograma · Cover FM 2-op (síntesis NumPy)",
        accent=AMBER, fmax_hz=fmax_view,
    )
    fig2.tight_layout()
    spec_cover_path = out_dir / "recreando_80s_spec_cover.png"
    fig2.savefig(str(spec_cover_path), dpi=110, facecolor=CREAM)
    plt.close(fig2)

    # Comparativo combinado (2 paneles compartiendo eje y)
    fig3, axes = plt.subplots(2, 1, figsize=(11, 5.6), dpi=110, facecolor=CREAM, sharex=True, sharey=True)
    plot_spec(axes[0], x_orig_cmp, sr,
              title="Referencia (externa)" if is_external_original else "Sonido Objetivo a Clonar",
              accent=BLUE, fmax_hz=fmax_view)
    plot_spec(axes[1], cover_cmp, sr,
              title=f"Cover · ratio={ratio:.3f} · I_max={I_max:.1f}",
              accent=AMBER, fmax_hz=fmax_view)
    fig3.suptitle(
        "¿Coinciden las bandas? Si sí → ratio acertado. Si no → ajusta f_m/f_c.",
        color=INK, fontsize=10.5, fontstyle="italic", y=0.98,
    )
    fig3.tight_layout()
    spec_compare_path = out_dir / "recreando_80s_spec_compare.png"
    fig3.savefig(str(spec_compare_path), dpi=110, facecolor=CREAM)
    plt.close(fig3)

    # Si usamos la referencia generada internamente, la guardamos también como un
    # WAV para que la slide pueda reproducirlo.
    if not is_external_original:
        target_path = out_dir / "original_80s.wav"
        sf.write(str(target_path), normalize_peak_dbfs(x_orig_cmp, -2.0), sr, subtype="PCM_16")
        audio_outputs = {
            "cover_80s.wav": cover_path,
            "cover_80s_melody.wav": melody_path,
            "original_80s.wav": target_path,
        }
    else:
        audio_outputs = {
            "cover_80s.wav": cover_path,
            "cover_80s_melody.wav": melody_path
        }

    return {
        "audio": audio_outputs,
        "images": {
            spec_orig_path.name: spec_orig_path,
            spec_cover_path.name: spec_cover_path,
            spec_compare_path.name: spec_compare_path,
        },
        "meta": {
            "sr": sr,
            "duration_s": dur,
            "fc": fc,
            "ratio": ratio,
            "I_max": I_max,
            "detune_hz": detune_hz,
            "master_dbfs": master_dbfs,
            "ADSR_I": {"A": A_env, "D": D_env, "S": S_env, "R": R_env},
            "is_external_original": is_external_original,
            "params": params,
        },
    }

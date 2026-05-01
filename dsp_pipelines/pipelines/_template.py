"""
dsp_pipelines/pipelines/_template.py
=====================================
Plantilla mínima de un pipeline DSP. Copiar como `<mi-id>.py`.

Contrato (ver .claude/rules/python-dsp-base.md):

    def run(input_wav: Path, out_dir: Path, **params) -> dict
        returns {"audio": {logical: Path}, "images": {logical: Path}, "meta": {...}}
"""

from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


def run(input_wav: Path, out_dir: Path, **params: Any) -> dict[str, Any]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) Cargar audio (mono float32).
    x, sr = sf.read(str(input_wav), always_2d=False)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = x.astype(np.float32)

    # 2) Procesar (placeholder: passthrough con normalización).
    y = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-1 / 20)  # pico a -1 dBFS

    # 3) Guardar audio.
    audio_out = out_dir / "processed.wav"
    sf.write(str(audio_out), y, sr, subtype="PCM_16")

    # 4) Guardar imagen pedagógica.
    fig, ax = plt.subplots(figsize=(12, 4), dpi=100, facecolor="#faf8f3")
    ax.plot(np.arange(len(y)) / sr, y, color="#2563eb", linewidth=0.6)
    ax.set_xlabel("t (s)")
    ax.set_ylabel("amplitud")
    ax.set_facecolor("#faf8f3")
    ax.grid(alpha=0.2)
    fig.tight_layout()
    img_out = out_dir / "waveform.png"
    fig.savefig(str(img_out), dpi=100, facecolor=fig.get_facecolor())
    plt.close(fig)

    return {
        "audio": {"processed": audio_out},
        "images": {"waveform": img_out},
        "meta": {"sr": int(sr), "samples": int(len(y)), "params": params},
    }

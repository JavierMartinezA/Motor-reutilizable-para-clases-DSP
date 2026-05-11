#!/usr/bin/env python3
"""
sync_to_public.py
=================
Sincroniza los artefactos generados por los pipelines DSP en
`backend/sessions/` y `dsp_pipelines/outputs/` hacia el
frontend (`frontend/public/audio/` y `frontend/public/imagenes/`).

Lee `frontend/src/config/course_config.json` → `pipelines.<id>.outputs`
para resolver nombres lógicos → archivos destino.

Si no hay mapeo en el config, hace una copia "best effort" con los nombres
originales (modo permisivo, útil para iteración rápida).

Uso:
    python sync_to_public.py            # sincroniza todos los pipelines del config
    python sync_to_public.py <id>       # solo un pipeline
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "frontend" / "src" / "config" / "course_config.json"
PUBLIC_AUDIO = ROOT / "frontend" / "public" / "audio"
PUBLIC_IMG = ROOT / "frontend" / "public" / "imagenes"

OUTPUTS_BASES = [
    ROOT / "dsp_pipelines" / "outputs",
    ROOT / "backend" / "sessions",
]

AUDIO_EXTS = {".wav", ".mp3", ".ogg", ".flac"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".svg", ".webp"}


def _load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def _ensure_dirs() -> None:
    PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)
    PUBLIC_IMG.mkdir(parents=True, exist_ok=True)


def _find_artifact(name: str) -> Path | None:
    """Busca recursivamente un archivo por nombre exacto en las bases de output."""
    for base in OUTPUTS_BASES:
        if not base.exists():
            continue
        for candidate in base.rglob(name):
            if candidate.is_file():
                return candidate
    return None


def _copy(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"  · {src.name}  ->  {dst.relative_to(ROOT)}")


def sync_pipeline(pid: str, spec: dict) -> int:
    outputs = spec.get("outputs", {}) or {}
    audio_map = outputs.get("audio", {}) or {}
    image_map = outputs.get("images", {}) or {}
    copied = 0
    print(f"[{pid}] sincronizando...")
    for src_name, dst_name in audio_map.items():
        src = _find_artifact(src_name)
        if src is None:
            print(f"  ! no encontrado: {src_name}")
            continue
        _copy(src, PUBLIC_AUDIO / dst_name)
        copied += 1
    for src_name, dst_name in image_map.items():
        src = _find_artifact(src_name)
        if src is None:
            print(f"  ! no encontrado: {src_name}")
            continue
        _copy(src, PUBLIC_IMG / dst_name)
        copied += 1
    return copied


def sync_permissive() -> int:
    """Sin mapeo en config: copia toda la carpeta outputs/ tal cual."""
    copied = 0
    for base in OUTPUTS_BASES:
        if not base.exists():
            continue
        for f in base.rglob("*"):
            if not f.is_file():
                continue
            ext = f.suffix.lower()
            if ext in AUDIO_EXTS:
                _copy(f, PUBLIC_AUDIO / f.name)
                copied += 1
            elif ext in IMAGE_EXTS:
                _copy(f, PUBLIC_IMG / f.name)
                copied += 1
    return copied


def main(argv: list[str]) -> int:
    _ensure_dirs()
    cfg = _load_config()
    pipelines = cfg.get("pipelines", {}) or {}
    only = argv[1] if len(argv) > 1 else None

    if only:
        spec = pipelines.get(only)
        if spec is None:
            print(f"pipeline '{only}' no declarado en course_config.json")
            return 1
        n = sync_pipeline(only, spec)
        print(f"OK · {n} archivo(s) copiado(s)")
        return 0

    if not pipelines:
        print("course_config.pipelines vacio -> modo permisivo")
        n = sync_permissive()
        print(f"OK · {n} archivo(s) copiado(s)")
        return 0

    total = 0
    for pid, spec in pipelines.items():
        total += sync_pipeline(pid, spec)
    print(f"OK · {total} archivo(s) copiado(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

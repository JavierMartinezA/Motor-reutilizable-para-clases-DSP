"""
backend/main.py
===============
FastAPI scaffold genérico para clases de procesamiento de audio.

Endpoints:
    POST /api/upload                  → recibe WAV/blob, crea sesión, devuelve id
    POST /api/run/{pipeline_id}/{sid} → ejecuta un pipeline DSP sobre la sesión
    GET  /api/sessions/{sid}/{file}   → descarga un archivo generado
    GET  /api/health                  → ping
    GET  /static/sessions/...         → assets servidos directo

Pipelines DSP se descubren por nombre desde:
    ../dsp_pipelines/pipelines/<id>.py  con función run(input_wav, out_dir, **params)

NO contiene lógica de dominio; cada clase agrega su pipeline en `dsp_pipelines/pipelines/`.

Ejecutar:
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8765
"""

import sys
import uuid
import time
import shutil
import threading
import importlib
from pathlib import Path
from typing import Any

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

# ─── Layout del repo ─────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
PIPELINES_DIR = ROOT / "dsp_pipelines" / "pipelines"
sys.path.insert(0, str(ROOT / "dsp_pipelines"))

SESSIONS_DIR = HERE / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)
SESSION_TTL_SEC = 60 * 30
_lock = threading.Lock()


def _cleanup_old_sessions() -> None:
    now = time.time()
    with _lock:
        for entry in SESSIONS_DIR.iterdir():
            if entry.is_dir() and now - entry.stat().st_mtime > SESSION_TTL_SEC:
                shutil.rmtree(entry, ignore_errors=True)


def _load_pipeline(pipeline_id: str):
    """Importa pipelines.<pipeline_id> y retorna la función run()."""
    module_name = f"pipelines.{pipeline_id}"
    try:
        mod = importlib.import_module(module_name)
        importlib.reload(mod)  # permite editar pipelines en caliente
    except ModuleNotFoundError as e:
        raise HTTPException(404, f"pipeline '{pipeline_id}' no existe") from e
    if not hasattr(mod, "run"):
        raise HTTPException(500, f"pipeline '{pipeline_id}' no expone run()")
    return mod.run


# ─── App ─────────────────────────────────────────────────────────────────
app = FastAPI(title="DSP Boilerplate Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static/sessions",
    StaticFiles(directory=str(SESSIONS_DIR), check_dir=False),
    name="sessions_static",
)


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "pipelines": sorted(
            p.stem for p in PIPELINES_DIR.glob("*.py")
            if not p.stem.startswith(("_", "."))
        ),
    }


@app.post("/api/upload")
async def upload_audio(file: UploadFile = File(...)) -> dict[str, str]:
    """Recibe un archivo (típicamente WAV) y crea una sesión nueva."""
    _cleanup_old_sessions()
    sid = uuid.uuid4().hex[:12]
    sdir = SESSIONS_DIR / sid
    sdir.mkdir(parents=True, exist_ok=True)
    dest = sdir / "input.wav"
    data = await file.read()
    if not data:
        raise HTTPException(400, "archivo vacío")
    dest.write_bytes(data)
    return {"session_id": sid, "input": str(dest.relative_to(SESSIONS_DIR))}


@app.post("/api/run/{pipeline_id}/{sid}")
async def run_pipeline(
    pipeline_id: str,
    sid: str,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Ejecuta `pipelines/<pipeline_id>.run()` sobre la sesión indicada."""
    sdir = SESSIONS_DIR / sid
    inp = sdir / "input.wav"
    if not inp.exists():
        raise HTTPException(404, f"sesión '{sid}' sin input.wav")
    run_fn = _load_pipeline(pipeline_id)
    out_dir = sdir / pipeline_id
    out_dir.mkdir(exist_ok=True)
    try:
        result = run_fn(inp, out_dir, **(params or {}))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"pipeline error: {e}") from e

    def _rel(p: Path) -> str:
        return str(Path(p).resolve().relative_to(SESSIONS_DIR))

    audio = {k: _rel(v) for k, v in (result.get("audio") or {}).items()}
    images = {k: _rel(v) for k, v in (result.get("images") or {}).items()}
    return {
        "session_id": sid,
        "pipeline": pipeline_id,
        "audio": audio,
        "images": images,
        "meta": result.get("meta", {}),
    }


@app.get("/api/sessions/{sid}/{path:path}")
def get_session_file(sid: str, path: str):
    f = (SESSIONS_DIR / sid / path).resolve()
    base = SESSIONS_DIR.resolve()
    if base not in f.parents:
        raise HTTPException(403, "fuera de la carpeta de sesiones")
    if not f.exists() or not f.is_file():
        raise HTTPException(404, "no encontrado")
    return FileResponse(str(f))


@app.delete("/api/sessions/{sid}")
def delete_session(sid: str) -> JSONResponse:
    sdir = SESSIONS_DIR / sid
    if sdir.exists():
        shutil.rmtree(sdir, ignore_errors=True)
    return JSONResponse({"deleted": sid})

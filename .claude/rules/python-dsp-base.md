# Rule · Python DSP Base

## WHAT
Reglas para los pipelines de procesamiento de señales en `dsp_pipelines/`.
Cada clase implementa **un pipeline** como un módulo separado bajo
`dsp_pipelines/pipelines/<id>.py` con una firma única `run()` y un
contrato fijo de entrada/salida. Esto desacopla la lógica DSP del frontend.

## WHY
- El frontend NO debe saber qué algoritmo se está ejecutando. Solo consume
  archivos finales en `frontend/public/audio/` y `public/imagenes/`.
- Cada nuevo dominio (filtros, AM/FM, STFT, picos, ...) se añade creando un
  archivo y registrándolo en `course_config.json`, sin tocar el motor.
- El script `sync_to_public.py` y el hook `PostToolUse` automatizan la copia
  de outputs al frontend → cero intervención humana.

## HOW

### Contrato del pipeline

Cada `pipelines/<id>.py` debe exponer:

```python
from pathlib import Path
from typing import TypedDict

class PipelineResult(TypedDict):
    audio: dict[str, Path]   # nombre_lógico → archivo .wav generado
    images: dict[str, Path]  # nombre_lógico → archivo .png generado
    meta: dict               # parámetros usados (sr, n_fft, ...)

def run(input_wav: Path, out_dir: Path, **params) -> PipelineResult:
    """Procesa input_wav y deja todos los artefactos en out_dir."""
    ...
```

- `input_wav`: archivo en `inputs/`. Único punto de entrada.
- `out_dir`: SIEMPRE `outputs/<id>/`. El pipeline lo crea si no existe.
- `params`: kwargs serializables que llegan desde `course_config.json`.

### Plantilla mínima

Ver `pipelines/_template.py`. Copiar y completar:
1. Cargar audio con `soundfile` (mono float32).
2. Validar parámetros (frecuencias, ventanas).
3. Procesar (numpy/scipy únicamente — no librerías exóticas).
4. Guardar `.wav` con `sf.write(..., subtype='PCM_16')`.
5. Guardar `.png` con `matplotlib` y backend `Agg`.
6. Retornar `PipelineResult` con paths absolutos.

### Sincronización al frontend

Tras correr cualquier pipeline, ejecutar:
```bash
python sync_to_public.py
```
o dejar que el hook `PostToolUse` (registrado en `.claude/settings.json`) lo
dispare automáticamente.

`sync_to_public.py` lee `course_config.json` → busca `pipeline_outputs` por
slide-id → copia con nombres normalizados a `frontend/public/audio/` y
`frontend/public/imagenes/`.

### Convenciones DSP estables

- **Sample rate por defecto:** 44100 Hz.
- **Tamaño de ventana FFT:** 2048 (resolución 21.53 Hz/bin) salvo motivo
  explícito documentado en el pipeline.
- **Solapamiento:** 75 % (hop 512) para STFT pedagógicas.
- **Normalización de WAV:** pico a -1 dBFS (`x / max(|x|) * 10**(-1/20)`)
  antes de escribir, para evitar clipping al reproducir.
- **Imágenes pedagógicas:** 1200×600, dpi 100, fondo `#faf8f3` (cream),
  fuentes Inter/Newsreader si están disponibles, en su defecto sans-serif.

### Anti-patrones a rechazar

- ❌ Hardcodear paths absolutos del filesystem en el pipeline.
- ❌ Llamar al frontend desde Python (acople inverso).
- ❌ Importar entre pipelines (`pipelines/a.py` no debe importar `b.py`).
  Si comparten utilidades, ponerlas en `dsp_pipelines/dsp_utils.py`.
- ❌ Devolver `None` o lanzar excepciones silenciadas; siempre `PipelineResult`.
- ❌ Mezclar lectura de `inputs/` con escritura fuera de `outputs/`.
- ❌ Persistir estado global (variables módulo); cada `run()` es puro.

### Checklist al añadir un pipeline

- [ ] Archivo único `pipelines/<id>.py` ≤ 400 líneas.
- [ ] Firma `run(input_wav, out_dir, **params) -> PipelineResult`.
- [ ] Salidas escritas exclusivamente en `out_dir`.
- [ ] Registro en `course_config.json` bajo `pipelines.<id>`.
- [ ] Probado con `python sync_to_public.py` que copia los assets esperados.
- [ ] Sin dependencias fuera de `requirements.txt` (numpy, scipy, soundfile,
      matplotlib).

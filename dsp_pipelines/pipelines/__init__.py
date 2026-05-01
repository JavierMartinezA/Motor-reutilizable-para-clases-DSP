"""Punto de extensión para pipelines DSP.

Cada clase agrega un módulo `<id>.py` con la firma:

    def run(input_wav: pathlib.Path, out_dir: pathlib.Path, **params) -> dict:
        return {"audio": {...}, "images": {...}, "meta": {...}}

Ver `_template.py` para una plantilla mínima y
`.claude/rules/python-dsp-base.md` para reglas detalladas.
"""

# Instrucciones de Uso — DSP Slides Boilerplate

Boilerplate genérico para clases de procesamiento de señales digitales.
Dos servicios: backend Python (FastAPI) + frontend React/Vite.

## 1. Requisitos Previos

- **Python 3.10+** (con "Add Python to PATH" durante la instalación).
- **Node.js 18+**.

## 2. Instalación inicial

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
```

### Frontend (Node.js)
```bash
cd frontend
npm install
```

## 3. Levantar los servidores

### Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8765
```

### Frontend (en otra terminal)
```bash
cd frontend
npm run dev
```

Abrir http://localhost:4020 (las flechas `←` y `→` cambian de slide).

## 4. Estructura del scaffold

```
.
├── frontend/                       # frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx                   # router config-driven (motor)
│   │   ├── config/course_config.json # fuente de verdad: slides + pipelines
│   │   ├── content/content.md        # texto teórico/fórmulas por slide-id
│   │   ├── slides/<id>/Slide.jsx     # un componente por clase
│   │   ├── slides/index.js           # registro id → componente
│   │   ├── components/               # SlideLayout, MathFormula, DSPCanvas3D, AudioPlayer
│   │   └── voice/LiveVoiceContext.jsx# RecorderProvider genérico
│   └── public/{audio,imagenes}/      # assets estáticos consumidos por slides
├── backend/
│   ├── main.py                       # FastAPI scaffold (sin lógica de dominio)
│   └── requirements.txt
├── dsp_pipelines/
│   ├── pipelines/<id>.py             # pipelines DSP por clase
│   ├── inputs/                       # audios fuente
│   └── outputs/                      # artefactos generados
├── sync_to_public.py                 # copia outputs/ → frontend/public/
├── _template/                        # plantillas few-shot (theory + slide)
└── .claude/rules/                    # context OS (WHAT/WHY/HOW, ≤150 líneas)
```

## 5. Crear una clase nueva

1. Editar `frontend/src/config/course_config.json` y agregar entradas en `slides[]`.
2. `cp -r frontend/src/slides/_template frontend/src/slides/<mi-id>`.
3. Registrar el componente en `frontend/src/slides/index.js`.
4. Pegar texto/fórmulas en `frontend/src/content/content.md` bajo `## <mi-id>`.
5. (opcional) Implementar `dsp_pipelines/pipelines/<mi-id>.py` y registrarlo en `course_config.pipelines`.
6. `python sync_to_public.py` para copiar audios/imágenes generadas al frontend.

## 6. Solución de problemas

- **Mic no graba:** asegurarse de que el backend corre en :8765 (variable `VITE_BACKEND_URL`).
- **Slide aparece en blanco con `MissingSlide`:** el id está en el config pero no en `slides/index.js`.
- **Pipeline no encontrado (404):** crear `pipelines/<id>.py` con función `run()`.
- **Conflictos de puertos:** verificar que :4020 y :8765 estén libres.

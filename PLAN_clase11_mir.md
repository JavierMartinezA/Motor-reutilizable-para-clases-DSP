# Plan de Implementación — Clase 11 · MIR & Audio Fingerprinting (Shazam)

> Deck `mir` · URL estable `…/#mir` · acento violeta `#7c3aed`.
> Documento de diseño que el agente sigue al implementar, actuando como
> profesor que revisa marco teórico + plan antes de tocar cada slide.

## 0 · Fuentes y cómo se usan

| Fuente (raíz del repo) | Rol en esta clase |
|---|---|
| `presentacion_mir_shazam.md` | **Estructura canónica.** Define los 9 slides, sus títulos, subtítulos y contenido mínimo obligatorio. Todo lo que aquí aparece **debe** estar presente. |
| `slides_11.md` | **Guion del profesor (de la Cuadra).** Diccionario de símbolos, metáforas ("estrellas/constelación"), tablas de features, ritual de oído, desafío relámpago. Fuente principal de redacción y conexiones S05/S07. |
| `Marco Teórico MIR Audio Fingerprinting.md` | **Rigor matemático.** Definiciones formales (ZCR, centroide, flux, peak-picking, hashing, histograma de offsets). Se cita para fórmulas y justificaciones `[WHY]`. |
| `fun_task_11.md` | **Fun Task (slide 08).** Tracks 1–3, tolerancias (`±2 bins, ±1 frame`), curva precisión-vs-SNR, ataques (transposición, tempo, lowpass, eco, voz). |
| `_template/_reference/demo_mir.html` | **Motor DSP de referencia.** STFT/FFT/peak-picking/hashes/matching/features ya implementados en JS vanilla + 5 módulos visuales. Se porta a React en `_mir_shared.jsx`. |

## 1 · Arquitectura técnica

Replicar el patrón ya probado en `sintesis_fm/`: un módulo toolkit
`frontend/src/slides/_mir_shared.jsx` que centraliza DSP + componentes de
laboratorio, y 9 `Slide.jsx` delgados que lo consumen. Cero cambios al motor
(`App.jsx`), config-driven (ya declarado en `course_config.json` deck `mir`).

### 1.1 `_mir_shared.jsx` (núcleo nuevo)
Portar desde `demo_mir.html` a funciones puras + componentes React:

- **DSP puro** (sin DOM): `fft`, `stft`, `detectPeaks`, `makeHashes`,
  `matchSimple`, `matchHistogram`, `synthSong`, `addNoise`, `computeFeatures`,
  `MELODIAS`. Igual matemática que el demo (FFT Cooley-Tukey, N_FFT=1024, HOP=256).
- **Audio**: `useMirAudio()` → wrapper de `AudioContext` con `playBuffer(float32)`
  y teardown al desmontar (silencia al salir de slide; regla "no audio colgado").
- **Canvas components** (memoizados, fondo oscuro solo dentro del canvas, lo
  permite la regla threejs/canvas para datos espectrales):
  `<Spectrogram spec peaks pairs anchor />`, `<ScoreBars scores winner />`,
  `<OffsetHistogram hists />`, `<FeatureWaveform audio />`.
- **Constantes de color** reexportadas de la paleta canónica + acento MIR violeta.
- **UI**: reutilizar `PillButton`, `Slider`, `RevealButton`, `NarrativeBlock`,
  `SubStepTabs` de `sintesis_fm/_shared.jsx` (no duplicar) o reexportarlos.

### 1.2 Regla de oro por slide
- Zero-scroll en 1080p/1440p.
- Pasos manuales (profesor), nunca `setTimeout` para avanzar.
- Fórmulas en `<MathFormula>` (KaTeX), colores de variable = colores de gráfica.
- Texto teórico vive en `content.md` bajo el `## <id>` ya creado; el JSX lo
  referencia conceptualmente (no se hardcodea prosa larga).

## 2 · Diseño slide por slide

Cada slide indica: **objetivo**, **fuente**, **layout**, **interacción**,
**rigor matemático** y la **mejora pedagógica** (metáfora / laboratorio activo).

---

### Slide 01 · `portada_mir` — De producir a entender
- **Fuente:** `presentacion` Slide 1; `slides_11` §1 ("De producir sonido a entender").
- **Objetivo:** anclar el giro del curso (S07–S10 sintetizaban; hoy se analiza).
- **Layout:** título serif grande + subtítulo. Panel derecho: micro-animación
  "WAV → significado" (forma de onda que colapsa en etiquetas: *BPM, key, "¿qué canción?"*).
- **Mejora:** línea de tiempo CREATION→ANALYSIS (S05 STFT … S11 hoy … S12 difusión)
  citando el cierre de `slides_11` §9.
- **Rigor:** ninguno aún; sembrar "el espectrograma es la materia prima de MIR".

### Slide 02 · `problema_shazam` — El milagro
- **Fuente:** `presentacion` Slide 2; `slides_11` §3 (escenario 2003 + la trampa).
- **Objetivo:** plantear el problema y **descartar la fuerza bruta**.
- **Layout:** escenario (bar ruidoso, 10 s, DB de millones, < 3 s) a la izquierda;
  a la derecha el "muro" de la correlación cruzada.
- **Rigor / momento clave:** mostrar el cálculo inviable de `slides_11`:
  N=10M × 4 min × 44.1 kHz ⇒ **~10¹⁴ operaciones/query**. Tachado en rojo.
- **Mejora:** botón "revelar" que cambia de "fuerza bruta ✗" a la idea de huellas
  comprimidas (transición a slide 5).

### Slide 03 · `features_audio` — Descriptores
- **Fuente:** `presentacion` Slide 3; `slides_11` §2; `Marco Teórico` (defs).
- **Objetivo:** bajo nivel vs alto nivel; ZCR, centroide, rolloff, flatness.
- **Rigor (KaTeX, con colores):**
  - ZCR: `$\frac{1}{2(N-1)}\sum |\,\mathrm{sgn}\,x[n]-\mathrm{sgn}\,x[n-1]|\cdot f_s$`
  - Centroide: `$\mu_f=\frac{\sum_k f_k|X_k|}{\sum_k|X_k|}$` (centro de masa, azul=peso).
- **Interacción (laboratorio activo):** port del **módulo 5 (Features)** del demo —
  botones tono armónico / percusivo / ruido / voz; muestra ZCR, centroide, rolloff,
  flatness, RMS **en vivo** sobre la waveform. Ancla la física: ruido→flatness≈1.
- **Mejora:** tabla `slides_11` (bombo 100–300 Hz … hi-hat 6–10 kHz) que se resalta
  según el sonido activo. Conexión a S07 (centroide = promedio de picos del modelo SMS).

### Slide 04 · `onset_bpm` — Onsets y ritmo
- **Fuente:** `presentacion` Slide 4; `slides_11` §2 (onset detection).
- **Rigor:** Spectral Flux `$SF(m)=\sum_k \max(0,|X(m,k)|-|X(m-1,k)|)$`
  (la "derivada positiva" del espectro). Pico de flux ⇒ onset.
- **Interacción:** waveform con función de novelty (flux) debajo; picos de onset
  marcados; de la periodicidad de los picos → estimación de BPM (autocorrelación).
- **Mejora:** "el latido del audio" — onsets como puerta a BPM, segmentación,
  sincronía (cita `slides_11`). Paso revelado: flux → suavizado → picos → BPM.

### Slide 05 · `pipeline_shazam` — Anatomía (Avery Wang 2003)
- **Fuente:** `presentacion` Slide 5; `slides_11` §3 (3 ideas) + §3 zona objetivo; `Marco Teórico`.
- **Objetivo:** el pipeline `audio → STFT → picos → pares (f1,f2,Δt) → hash table`.
- **Interacción (pieza central #1):** stepper de 4 pasos (state `step`, control del
  profesor) que enciende cada bloque del diagrama; en paralelo el panel visual va de
  espectrograma → constelación (port **módulo 1**) → pares ancla-target con zona
  objetivo (port **módulo 2**) → tabla de hash `{H → (ID, t1)}`.
- **Rigor:** hash `$H=(f_1,f_2,\Delta t)$` ligado a `$t_1$`; búsqueda `$O(1)$`;
  espacio ≈ 1024×1024×16 ≈ 17M cubetas (demo) vs ~10⁴ usadas/canción.
- **Mejora:** metáfora de Wang de las **estrellas** (`slides_11`): una estrella no
  identifica; dos con su distancia angular, sí. `[WHY]` fan-out=5 (de `fun_task`).

### Slide 06 · `demo_mir` — Laboratorio en el navegador (corazón de la clase)
- **Fuente:** `presentacion` Slide 6; demo completo.
- **Objetivo:** experiencia interactiva integral. Port de los **5 módulos** del demo
  con `<SubStepTabs>`: Constelación · Hashes · Mini-Shazam · Ruido · Features.
- **Interacción (pieza central #2):**
  1. *Mini-Shazam*: Identificar query limpia vs ruidosa; barras de score simple vs
     histograma; veredicto con umbral de rechazo (margen < 2× ⇒ "no identificada").
  2. *Constelación*: slider picos/frame → trade-off info vs ruido/DB.
  3. *Hashes*: fan-out, zona objetivo, Δt máx; hash actual `(f1,f2,Δt)`.
  4. *Ruido*: slider SNR; desafío "¿a qué SNR se rompe?" (sobrevive ~ −10/−15 dB).
  5. *Features*: refuerzo del slide 3.
- **Nota:** todo el DSP corre client-side (ya existe en el demo). Sin backend.

### Slide 07 · `histograma_offsets` — El truco maestro
- **Fuente:** `presentacion` Slide 7; `slides_11` §4 (histograma) + viz ASCII; `Marco Teórico`.
- **Objetivo:** por qué el conteo simple no basta y el histograma sí.
- **Rigor:** offset `$\Delta t_{\text{off}}=t_{db}-t_{query}$`. Canción correcta ⇒
  delta de Dirac (pico aislado); incorrecta ⇒ nube plana (ruido).
- **Interacción:** dos histogramas lado a lado (correcta vs incorrecta) usando
  `matchHistogram` real sobre las melodías A/B; toggle "simple vs histograma" que
  muestra cómo el **margen de victoria** salta 3–10× (cita `fun_task` Track 2).
- **Mejora:** el "momento ahá": Shazam no busca más hashes, busca el **pico** más alto.

### Slide 08 · `limites_shazam` — Fun Task y dónde se rompe
- **Fuente:** `presentacion` Slide 8; `fun_task_11.md` completo; `slides_11` §5.
- **Objetivo:** presentar la Fun Task 11 + puntos ciegos del algoritmo.
- **Contenido Fun Task:** Track 1 (DB ≥5 canciones), Track 2 (curva precisión-vs-SNR
  a +30…−10 dB; histograma rompe 5–10 dB más abajo), Track 3 ("rompe tu Shazam":
  transposición ×2^(1/12), tempo ±5/10/20%, lowpass 1 kHz, eco 100 ms/0.4, voz).
  Mostrar tolerancias `±2 bins, ±1 frame` y contrato `[WHY]`.
- **Rigor:** tabla de ataques con *por qué* falla cada uno (`slides_11` §5):
  transposición desplaza picos → cambia toda la llave; time-stretch escala Δt.
- **Mejora:** curva precisión-vs-SNR esquemática (simple vs histograma) anticipando
  el entregable `ft11_curva_precision.png`.

### Slide 09 · `discusion_mir` — Q&A y evolución
- **Fuente:** `presentacion` Slide 9; `slides_11` §9 + preguntas (a)(b)(c).
- **Objetivo:** cierre conceptual y apertura a transposición-invariante.
- **Contenido:** colisiones (hash individual vs secuencia alineada — improbabilidad
  astronómica); covers/transposición → falla de Wang; solución moderna **AcoustID /
  Chroma features** y **relative-pitch hashes** `$(f_2/f_1,\Delta t)$`.
- **Mejora:** 3 preguntas para debatir (incl. **YouTube Content ID**, `slides_11`)
  + puente a S12 (difusión: invertir el problema, features→audio).

---

## 3 · Orden de implementación

1. **`_mir_shared.jsx`** — portar DSP (FFT/STFT/peaks/hashes/matching/features) +
   `useMirAudio` + canvas components. Reexportar UI de `sintesis_fm/_shared.jsx`.
2. **Slides de contenido** (rápidos): 01, 02, 09 (prosa + KaTeX + reveal).
3. **Slides con fórmula+mini-viz:** 03 (features lab), 04 (flux/onsets), 07 (histograma).
4. **Slides pesados:** 05 (pipeline stepper), 06 (5 módulos en tabs).
5. **`content.md`**: revisar/expandir anclas `## <id>` ya existentes con las
   fórmulas y tablas citadas.
6. **Build:** `cd frontend && npm run build` debe pasar. Verificar `#mir` carga las 9.

## 4 · Checklist de aceptación (por slide)
- [ ] Carga desde `course_config.json` deck `mir` sin tocar el motor.
- [ ] Zero-scroll a 1080p y 1440p.
- [ ] Fórmulas en KaTeX; color de variable = color de su gráfica.
- [ ] Interacciones manuales (sin timers de avance).
- [ ] DSP client-side, audio se silencia al cambiar de slide.
- [ ] Contenido mínimo del `presentacion_mir_shazam.md` presente y verificado.

## 5 · Riesgos y mitigaciones
- **Costo FFT en cliente:** N_FFT=1024 y melodías cortas (demo ya lo prueba fluido);
  memoizar `stft`/`peaks`/`hashes` por canción (cache como en el demo).
- **Audio colgado al navegar:** `useMirAudio` detiene fuentes en cleanup del efecto.
- **Canvas oscuro vs estética cream:** permitido para datos espectrales (regla
  threejs-canvas), enmarcado en panel cream con bordes/labels claros.
- **Zero-scroll en slide 06 (denso):** usar tabs (`SubStepTabs`), no apilar módulos.

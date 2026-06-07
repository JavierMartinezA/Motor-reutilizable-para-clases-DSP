# Desafío Semanal 11: "Mini-Shazam — rompe tu propio detector"

> *"Shazam no escucha música. Busca constelaciones de picos espectrales en una base de datos."*

---

## Contexto Creativo

En 2003 Avery Wang publicó un paper de 7 páginas que se volvió la base de Shazam. La idea es absurdamente simple: cada canción es una **constelación de picos en el espectrograma**. Identificar una canción en ambiente ruidoso es comparar constelaciones. Su algoritmo cambió cómo interactuamos con la música: hoy hay más de 3 mil millones de instalaciones de Shazam a nivel mundial.

Esta semana tu trabajo es triple: **implementar** un sistema completo de fingerprinting, **evaluarlo** en una curva precisión-vs-SNR, y — la parte entretenida — **construir tu propia base de datos y romperla a propósito** para entender dónde y por qué falla el algoritmo.

---

## El Contrato del Pair Programmer

Puedes usar IA para boilerplate (STFT, hash table, plots). La condición: **cada decisión de diseño** (por qué ese fan-out, por qué esa tolerancia, por qué ese umbral) lleva un comentario `[WHY]` que explica qué le ocurre al sistema — no qué hace la línea. Si usaste IA, declara la herramienta y el prompt principal en la cabecera del script.

**Malo:**
```python
# fan out 5 funciona bien
```

**Bueno:**
```python
# [WHY] fan_out=5: con 3 picos/frame eso es 5× más
# hashes que picos, suficiente redundancia pero sin
# explotar el tamaño de la DB.
```

> ⚠️ Sin `[WHY]` completos ⇒ **0 en Correctitud**.

---

## Lo que ya tienes

Del Desafío Relámpago 11, las funciones `stft_magnitude`, `detect_peaks`, `make_hashes`, `match_simple` y `match_with_histogram` con la lógica completa de fingerprinting + matching robusto.

---

## El Desafío — Tres tracks paralelos

### Track 1 — Tu base de datos personal

Construye una DB con **al menos 5 canciones reconocibles**. Tres opciones:

1. **Sintéticas con tus motores anteriores:** usa los sintetizadores de Fun Tasks 08 (substractiva), 09 (FM) y 10 (Karplus-Strong) para hacer 5 melodías cortas (10–15 s c/u). Ventaja: todo es tuyo y reproducible.
2. **Recortes de música real:** 10–15 s de 5 canciones reconocibles desde tu biblioteca (`.mp3`, `.wav`). Usa `librosa.load`.
3. **Mezcla:** 2–3 sintetizadas + 2–3 reales.

Genera fingerprints de las 5 y guarda la DB como `db.json` o pickle. Documenta en el README: qué canción es cada una, su duración, número de picos y de hashes.

---

### Track 2 — Curva precisión vs SNR

Para una de tus canciones, genera queries de **5 segundos** con ruido blanco a **6 niveles de SNR**: `+30, +20, +10, 0, -5, -10 dB`. Evalúa con:

- `match_simple` (conteo de hashes coincidentes).
- `match_with_histogram` (pico del histograma de offsets).

Para cada SNR y cada matcher, reporta: ¿identifica correctamente? ¿Cuál es el ratio entre el score del ganador y el del segundo lugar? Grafica como una **curva con SNR en X y ratio en Y**, una línea por matcher.

**Hipótesis a contrastar:** la curva con histograma se mantiene alta hasta SNR mucho más bajo que la curva simple. El punto de quiebre (donde el ratio cae a 1.0 = ambigua) debe estar **5–10 dB más bajo**.

---

### Track 3 — "Rompe tu Shazam" (la parte entretenida)

Para una canción de tu DB, intenta romper el detector de las siguientes formas y documenta qué pasa:

| Ataque | Descripción |
|---|---|
| **Transposición** | Sube la query medio tono (×2^(1/12) ≈ 1.0595 en las frecuencias originales, o usa `librosa.effects.pitch_shift` si trabajas con audio real). |
| **Cambio de tempo** | Acelera o desacelera la query un 5%, 10%, 20% (`librosa.effects.time_stretch`). |
| **Distorsión de bocina** | Aplica un filtro pasa-bajos con corte en **1 kHz** a la query. ¿Sobrevive? |
| **Eco/reverb** | Agrega una versión retrasada **100 ms** con **0.4 de amplitud** (es el cuello del bar ruidoso). |
| **Mezcla con voz** | Superpone con un audio corto de voz hablando. ¿Sobrevive? |

Para cada ataque: ¿identifica correctamente? ¿Por qué sí o por qué no? Una oración basta.

---

## Instrucciones Técnicas

1. **Hash table eficiente.** Usa `defaultdict(list)` indexado por el triplete cuantizado `(f1, f2, Δt)`. Para una DB de cinco canciones ~50k hashes en total — caben en memoria sin problema.

2. **Tolerancia bien elegida.** Usa `f-tol = ±2 bins` y `Δt-tol = ±1 frame`. Más estricto pierde queries ruidosas; más laxo dispara falsos positivos.

3. **Histograma de offsets.** La diferencia entre un Shazam que funciona y uno que no. No te saltes esta optimización.

4. **Bonus +10%: demo en vivo.** Usa el micrófono de tu PC para grabar la query en tiempo real (`sounddevice.rec`) y muéstrate la respuesta del sistema en menos de 2 segundos. Si haces esto, lo presentas en showcase.

5. **Bonus +5%: relative-pitch hashes.** En vez de codificar `(f1, f2, Δt)` codifica `(f2/f1, Δt)` (ratio en vez de frecuencias absolutas). Esto te da **invariancia a transposición**. Muéstralo funcionando con la query transpuesta del Track 3.

---

## Entregables y Autopsia Auditiva

La carpeta `fun_task_11/` debe contener:

- `shazam.py` — script con bloque `# AUTOPSIA AUDITIVA` al final, comentarios `[WHY]` y prompt de IA en la cabecera (si usaste).
- **Track 1:** `db/cancion_1.wav` ... `db/cancion_5.wav` (las 5 canciones de la DB) + `db/db.json` con los fingerprints + README descriptivo.
- **Track 2:** `queries/query_snr+XX.wav` para los 6 SNR + `ft11_curva_precision.png` con la curva ratio-vs-SNR para ambos matchers.
- **Track 3:** `ataques/` con un WAV por cada ataque (transposición, tempo, lowpass, eco, voz) y un Markdown `ataques_resultado.md` con tabla de resultados.
- `ft11_visualization.png` — **4 paneles:**
  - (a) espectrograma de una canción con su constelación superpuesta
  - (b) histograma de offsets canción correcta vs incorrecta
  - (c) curva ratio-vs-SNR
  - (d) tabla resumen de los ataques de Track 3

### Autopsia Auditiva (4–6 oraciones, en el script)

Tres preguntas obligatorias:

1. ¿A qué SNR exacto rompe tu `match_with_histogram`? ¿Y `match_simple`? ¿Cuántos dB de diferencia entre ambos?
2. De los 5 ataques de Track 3, ¿cuál fue el que más sorprendentemente **sí** sobrevivió? ¿Cuál esperabas que sobreviviera y rompió el sistema?
3. Si tu DB tuviera 1 millón de canciones (no 5), ¿cuál sería el principal cuello de botella: memoria, tiempo de matching, o falsos positivos? Una oración basta.

---

## Rúbrica de Showcase (30%)

### 1. Cool Factor (10%)

| Nivel | Criterio |
|---|---|
| **Bien** | Tu sistema identifica correctamente las 5 canciones de tu DB con queries limpias. |
| **Muy bien** | Identifica correctamente a SNR ≥ 0 dB usando histograma. La curva precisión-vs-SNR muestra el cruce esperado. |
| **Top** | Demo en vivo con micrófono. Tocas/silbas/reproduces una canción en tu teléfono y el script la identifica en < 3 segundos. |

### 2. Correctitud (10%)

- El sistema usa **pares de picos** (no picos solos).
- El histograma de offsets está implementado correctamente.
- La tolerancia es razonable (±2 bins, ±1 frame).
- Los fingerprints se guardan persistentemente (json/pickle).
- La curva precisión-vs-SNR es coherente (decae monótonamente).

### 3. Explicación (10%)

- En la autopsia argumentas **por qué** tu sistema rompe a un SNR específico (no "simplemente rompe").
- Justificas qué ataque sorprendió y por qué.
- Discutes los límites teóricos del algoritmo (¿qué tipo de ataque nunca podría sobrevivir?).

---

## Material de Apoyo

- **Base de código:** las funciones del Desafío Relámpago 11 (constelación + hashes + matching con histograma).
- **Demo en clase:** `demo_mir.html` con visualización de constelación, pares ancla-target, matching en vivo, curva de ruido y features (ZCR, centroide, rolloff). Úsalo para validar tu intuición antes de implementar.
- **Lectura:** Course Reader capítulo 11 (MIR, fingerprinting, features). Paper original Wang 2003 (7 páginas: las primeras 4 son las que importan). El blog de Christophe Cerisara tiene una explicación paso a paso muy clara con código Python.

**Para audio real (Tracks 1–3):**

```python
librosa.load()                    # lee mp3/wav/flac
librosa.effects.pitch_shift()     # transposición
librosa.effects.time_stretch()    # cambio de tempo
scipy.signal.butter / filtfilt    # filtro pasa-bajos
sounddevice.rec()                 # grabar con micrófono (bonus)
```

---

## Conexión hacia adelante

La próxima semana (Sesión 12, última del curso) vemos **modelos de difusión para audio** — cómo la IA genera música en vez de identificarla. Cerramos el ciclo: de análisis → síntesis → generación inteligente.

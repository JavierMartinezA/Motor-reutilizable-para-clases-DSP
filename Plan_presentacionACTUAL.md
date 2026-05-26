# Plan de Presentación — Hito 2
**Curso:** IEE3736-1 Análisis y Síntesis de Señales Musicales  
**Título:** Agente Autónomo de Diseño Paramétrico de Sonido mediante Síntesis FM y Descriptores MIR  
**Duración estimada:** 8–10 minutos  
**Total:** 6 diapositivas

**Assets disponibles en la raíz del proyecto:**
- `sac_fm_v2_1779764207_spectrograms.png` — espectrogramas comparativos Target vs Predicción SAC
- `sac_fm_v2_1779764207_reward_curve.png` — curva de aprendizaje SAC (2000 episodios)
- `sac_fm_v2_1779764207_target.wav` — audio del sonido objetivo
- `sac_fm_v2_1779764207_pred.wav` — audio de la predicción del agente

---

## Diapo 1 — Pivote del Proyecto

**Título:** De Transfer de Timbre Neuronal a Sound Matching Paramétrico

**Contenido:**

Dos columnas comparativas:

| Propuesta original (descartada) | Propuesta actual |
|---|---|
| RAVE / DDSP | Síntesis FM clásica (Chowning, 1973) |
| Parámetros no interpretables musicalmente | Parámetros con significado físico directo |
| Requiere GPU | CPU only (Intel Core i7) |
| Foco en generación neuronal | Foco en DSP + MIR — núcleo del curso |

**Nota para el expositor:** El cambio no fue un retroceso. Fue elegir interpretabilidad y alineación con el curso sobre complejidad computacional.

---

## Diapo 2 — El Problema: Sound Matching en FM

**Título:** ¿Qué es Sound Matching y por qué es difícil en síntesis FM?

**Contenido:**

Diagrama central (flujo horizontal):
```
Audio objetivo → [???] → Sintetizador FM → Audio sintetizado ≈ objetivo
```

Debajo, dos puntos concisos:

- **Sound Matching:** dado un audio objetivo, encontrar automáticamente los parámetros del sintetizador que lo repliquen.
- **La dificultad:** el espacio paramétrico FM es no lineal y no diferenciable. Un pequeño cambio en `ratio` o en el índice de modulación `I` puede bifurcar el espectro de un timbre armónico a ruido inarmónico.

**Visual principal:** imagen `slide_espectrogramas.png` a ancho completo. Ambos sonidos tienen exactamente los mismos parámetros excepto `ratio` — el único cambio es 1.0 → 3.5. La diferencia visual en el espectro habla por sí sola.

**Dos botones de audio interactivos (o reproducción en vivo):**
- 🔊 `slide_ratio_1.0.wav` — ratio = 1.0, espectro armónico ordenado
- 🔊 `slide_ratio_3.5.wav` — ratio = 3.5, espectro inarmónico caótico

**Nota para el expositor:** reproducir los dos audios en secuencia antes de avanzar. El público debe escuchar que un solo parámetro separa estos dos mundos sonoros. Ese es el problema que el agente tiene que navegar.

**Conclusión de la diapo:** No se puede usar gradiente directo → se necesita optimización de caja negra.

---

## Diapo 3 — RL como Solución + MDP

**Título:** Reinforcement Learning como optimizador de caja negra

**Contenido:**

Tabla comparativa de métodos (3 filas):

| Método | Limitación principal |
|---|---|
| Algoritmos evolutivos (CMA-ES) | Comienza desde cero ante cada nuevo sonido objetivo |
| Deep Learning supervisado (InverSynth) | Requiere miles de pares (audio, parámetros) etiquetados |
| **RL — este proyecto** | **Solo necesita una métrica de similitud acústica** |

Diagrama del ciclo MDP debajo de la tabla:
```
θ → [Sintetizador FM] → audio → [Extractor MIR] → estado s_t
↑                                                        |
[Agente SAC] ←————————— recompensa r ←——————————————————
```

Tres bullets que mapean el diagrama al lenguaje de señales:
- **Estado** `s_t ∈ ℝ⁵⁴`: descriptores MIR del audio actual + audio objetivo (no audio crudo)
- **Acción** `θ = [fc, ratio, I, feedback, A, D, S, R]`: los 8 parámetros del sintetizador
- **Recompensa** `r`: qué tan similares suenan el audio sintetizado y el objetivo — medido con STFT y MFCC

---

## Diapo 4 — Implementación del Prototipo

**Título:** Cómo funciona el prototipo

**Contenido:**

Tres columnas, cada una con título y 3–4 bullets cortos:

**Sintetizador (`synth.py`)**
- 2 operadores FM (Chowning)
- Envolvente ADSR completa
- Feedback en el modulador: expande el espacio tímbrico sin agregar operadores
- NumPy puro, 22050 Hz, 1 segundo

**Función de recompensa (`reward.py`)**
- Log-Spec MAE — envolvente espectral (w = 0.4)
- MFCC MAE — timbre cepstral (w = 0.4)
- Spectral Convergence — estructura global (w = 0.2)
- `r = exp(−2.0 · d)`, donde `d` es la distancia combinada normalizada

**Entorno (`env.py`)**
- API Gymnasium, acción continua normalizada a `[−1, 1]⁸`
- 50 pasos por episodio
- Termina anticipadamente si `r > 0.95`
- Target fijo por entrenamiento (ver nota abajo)

**Nota al pie de la diapo:**
> El agente actual resuelve un target a la vez — validación deliberada del pipeline completo antes de generalizar.

---

## Diapo 5 — Resultados

**Título:** Resultados: lo que funcionó y lo que no

**Layout:** dividir la diapo en dos mitades verticales.

**Mitad izquierda — tabla + curva de aprendizaje:**

Tabla de resultados completa. Destacar con color: fc en verde, ratio en rojo, I en amarillo. El resto en gris.

| Parámetro | Target | SAC | Error | |
|---|---|---|---|---|
| fc (Hz) | 440.0 | 432.4 | 7.6 | ✅ |
| ratio | 3.500 | 1.006 | 2.49 | ❌ |
| I | 8.000 | 9.467 | 1.47 | ⚠️ |
| feedback | 0.600 | 0.849 | 0.25 | ✓ |
| A (s) | 0.300 | 0.481 | 0.18 | ✓ |
| D (s) | 0.200 | 0.289 | 0.09 | ✓ |
| S | 0.500 | 0.612 | 0.11 | ✓ |
| R (s) | 0.400 | 0.347 | 0.05 | ✓ |
| **Recompensa final** | — | — | — | **r = 0.294** |

Debajo de la tabla: imagen `sac_fm_v2_1779764207_reward_curve.png` a tamaño reducido. La curva muestra convergencia clara desde recompensa acumulada ~4 hasta ~9.3 en 2000 episodios — el agente aprende.

**Mitad derecha — análisis visual + audio:**

Subtítulo pequeño antes de la imagen:
> **Cómo se generó el target:** se fijó manualmente `θ_tgt = [440 Hz, ratio=3.5, I=8.0, feedback=0.6, A=0.3s, D=0.2s, S=0.5, R=0.4s]` y se sintetizó con el mismo motor FM. El agente nunca vio estos parámetros — solo escuchó el audio resultante.

Imagen `sac_fm_v2_1779764207_spectrograms.png` (ambos paneles, tamaño completo en esta mitad). El espectrograma izquierdo (Target) muestra bandas laterales FM inarmónicas espaciadas irregularmente — el mismo tipo de espectro que el público ya escuchó en Diapo 2 con `ratio=3.5`. El espectrograma derecho (Predicción SAC) muestra bandas más densas y regulares — visualmente similar en energía global pero estructuralmente distinto.

Dos botones de audio interactivos (si la herramienta de slides lo permite) o indicación explícita de reproducir en vivo:
- 🔊 **Target** → `sac_fm_v2_1779764207_target.wav`
- 🔊 **Predicción SAC** → `sac_fm_v2_1779764207_pred.wav`

**Nota para el expositor:** reproducir ambos audios en secuencia. El público ya escuchó `ratio=3.5` en Diapo 2 — reconocerá el target. La predicción suena diferente aunque las métricas digan que son parecidos. Esa es la contradicción central del proyecto.

Bloque de texto corto debajo de los espectrogramas:

> **Hallazgo central:** `ratio=1.0` + `I=9.47` genera un espectro armónico que, promediado en MFCC y STFT, produce un MAE similar al objetivo inarmónico. El agente no falló en todo — fc, ADSR y feedback convergieron. El fracaso es localizado y estructural: métricas espectrales globales no discriminan entre espectros de ancho de banda similar pero estructura armónica distinta. Confirma: Salimi et al. (2024).

---

## Diapo 6 — Conclusiones y Próximos Pasos

**Título:** Qué se logró y hacia dónde va el proyecto

**Contenido:**

**Columna izquierda — Lo que se demostró:**
- Pipeline completo funcional end-to-end en CPU
- El agente converge correctamente en pitch (fc)
- La función de recompensa basada en STFT+MFCC genera mínimos locales explotables
- Las métricas espectrales globales son condición necesaria pero no suficiente

**Columna derecha — Hoja de ruta:**

| Paso | Acción | Objetivo |
|---|---|---|
| **Inmediato** | Agregar F0 via `pyin` en recompensa | Romper la degeneración del ratio |
| **Corto plazo** | Randomizar target en cada episodio | Política generalizable in-domain |
| **Futuro** | Sonidos reales (dataset NSynth) | Generalización out-of-domain |

**Frase de cierre de la presentación:**
> El agente actual valida el pipeline. El siguiente paso no requiere cambiar la arquitectura — solo enriquecer lo que el agente puede escuchar.
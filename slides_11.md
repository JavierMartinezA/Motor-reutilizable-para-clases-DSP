# Clase 11: MIR & Audio Fingerprinting

**Prof. Patricio de la Cuadra — 2026**

---

## Hoja de Ruta

1. Qué es MIR
2. Features de bajo nivel
3. Audio fingerprinting
4. Matching
5. Limitaciones
6. Ritual de oído y desafío relámpago
7. Laboratorio abierto
8. Fun Task 11 — Mini-Shazam
9. Cierre

---

## Diccionario de Símbolos

| Término | Definición |
|---|---|
| **MIR** | Music Information Retrieval. Extraer información semántica del audio crudo. |
| **Feature** | Un número (o vector) que describe alguna propiedad del audio. Bajo nivel (ZCR, centroide) vs alto nivel (BPM, acordes, género). |
| **Fingerprint** | Huella digital acústica. Identifica una grabación (no una canción). |
| **Constelación** | Conjunto de picos espectrales en un espectrograma. |
| **(f1, f2, Δt)** | Un hash de Shazam: par de picos. |
| **Fan-out** | Cuántos targets se aparean con cada ancla. |
| **Zona objetivo** | Rectángulo en el plano (t, f) donde se buscan targets. |
| **t_db − t_query** | Offset de tiempo de cada match. La distribución revela la verdadera identidad. |

> **Regla:** MIR es decirle al computador "escucha y entiende". Hoy lo limitamos a la pregunta más humilde: ¿qué canción es esta?

---

## 1 · Qué es MIR

### De "producir sonido" a "entender sonido"

Hasta hoy, todo el módulo CREATION fue sintetizar: aditiva (S07), substractiva (S08), FM (S09), modelado físico (S10). Hoy gira la pregunta:

> *Dado un audio, ¿qué puedo decir sobre él?*

**Aplicaciones cotidianas:**

- **Shazam** — "¿qué canción es?"
- **Spotify Radio / Discover Weekly** — "¿qué otra canción se le parece?"
- Detección de BPM automática en tu DAW.
- Auto-Tune y corrección de afinación.
- **Streaming licensing** — detectar automáticamente música con derechos en videos.

---

### Dos niveles de features

| | **Bajo nivel** (frame-by-frame) | **Alto nivel** (estructura) |
|---|---|---|
| **Ejemplos** | ZCR, centroide espectral, rolloff, MFCCs, spectral flux | BPM, key, acordes, género, mood |
| **Cómputo** | Directo desde STFT, sin entrenamiento | Requiere modelo (heurística o ML) |
| **Estabilidad** | Frame a frame, ruidoso | Más estable, agregado |
| **Uso** | Clasificación simple, fingerprinting | Recomendación, etiquetado automático |

> **La regla práctica:** Los features de alto nivel se construyen sobre los de bajo nivel. BPM se calcula sobre onsets, que se calculan sobre spectral flux, que se calcula sobre la STFT. **El espectrograma es la materia prima de casi todo MIR.**

---

## 2 · Features de bajo nivel

### Zero-Crossing Rate (ZCR)

Cuenta cuántas veces la señal cambia de signo por segundo.

$$\text{ZCR} = \frac{1}{2(N-1)} \sum_{n=1}^{N-1} |\text{sign}(x[n]) - \text{sign}(x[n-1])| \cdot f_s$$

- **ZCR alto:** señal con mucha actividad de alta frecuencia → percusión, agudos, consonantes.
- **ZCR bajo:** señal con energía concentrada en bajas → vocales sostenidas, instrumentos graves.

**Aplicación clásica:** Distinguir voz (ZCR moderada, varía mucho) de música (ZCR menos variable). También *voiced* vs *unvoiced* en habla: las consonantes fricativas (`/s/`, `/f/`) tienen ZCR muy alto; las vocales, bajo.

---

### Centroide Espectral

Dónde está el **centro de masa del espectro**. Una sola cifra que captura el "brillo".

$$\mu_f = \frac{\sum_k f_k \cdot |X_k|}{\sum_k |X_k|}$$

| Audio | Centroide típico | Característica perceptual |
|---|---|---|
| Bombo, contrabajo, bajo dub | 100–300 Hz | oscuro, grave |
| Voz hablada | 400–800 Hz | neutro |
| Violín, flauta, clavinet | 1.5–3 kHz | brillante |
| Hi-hat, platillos, ruido blanco | 6–10 kHz | frío, metálico |

> **La conexión con S07 (modelo sinusoidal):** El centroide es esencialmente "el promedio ponderado de los picos del modelo SMS". Donde S07 listaba los picos, MIR los resume en una cifra.

---

### Otros features de bajo nivel relevantes

| Feature | Descripción |
|---|---|
| **Spectral rolloff (85%)** | Frecuencia bajo la cual cae el 85% de la energía. Robusto a ruido. Permite distinguir voz de música. |
| **Spectral flatness** | Cociente entre media geométrica y aritmética del espectro. Cerca de 1: espectro plano (ruido). Cerca de 0: espectro tonal (armónico). |
| **Spectral flux** | `‖|X_t| − |X_{t−1}|‖₂`. Derivada del espectro en el tiempo. Pico de flux ⇒ onset (golpe percusivo, nueva nota). Base de la detección de BPM. |
| **MFCCs** | 12–20 coeficientes que comprimen el espectro perceptualmente (en escala mel). Features clásicos de reconocimiento de voz y género musical desde los 90s. Cada frame → vector en ℝ¹². |
| **Chroma features** | Vector de 12 dimensiones = energía en cada nota de la escala (Do, Do#, Re, ...). Útil para detección de acordes y de key. |

---

### Onset detection: el latido del audio

**Onset** = instante donde algo nuevo empieza (nota, golpe, palabra).

1. Calcular spectral flux frame a frame.
2. Suavizar (LP en el tiempo) para quitar ruido.
3. Detectar picos locales sobre un umbral adaptativo.

**Por qué los onsets son la puerta a todo lo demás:** Con la secuencia de onsets en el tiempo puedes:
- Calcular el BPM (período dominante de los intervalos entre onsets).
- Segmentar la pieza en notas.
- Sincronizar audio con video, MIDI, animaciones.

---

## 3 · Audio Fingerprinting

### El problema de Shazam (2003)

**Escenario:** alguien graba 10 segundos de una canción en un bar ruidoso con su teléfono. Tu sistema tiene que identificar la canción en menos de 5 segundos, contra una base de datos de millones.

**Restricciones:**
- Robusto al ruido (bar, gente hablando, distorsión de bocina).
- Robusto al inicio aleatorio (no sabemos dónde empieza la query dentro de la canción).
- Eficiente en una DB enorme.
- Tolerante a pequeñas diferencias de calidad (compresión MP3, ecualización).

> ⚠️ **La trampa que NO se debe caer:** "Calculemos correlación cruzada entre el query y cada canción de la DB." Con N=10M canciones de 4 minutos a 44.1 kHz ⇒ ~10¹⁴ operaciones por query. **Inviable.**

---

### La solución de Wang (2003): constelación + hashes

```
audio → STFT → picos locales → pares (f1, f2, Δt) → hash table
```

**Tres ideas centrales:**

1. **Solo picos.** El espectrograma completo es mucha información. Los picos sobreviven al ruido (los más fuertes siempre están).
2. **Pares, no picos sueltos.** Un pico solo cambia con ruido. Una relación geométrica entre dos picos es estable.
3. **Hash table.** Look-up O(1) en la DB usando el triplete `(f1, f2, Δt)` como clave.

---

### Constelación: del espectrograma a los picos

Del espectrograma de magnitud, extrae solo los máximos locales fuertes:

$$P = \{(t_i, f_i) : |X(t_i, f_i)| > \tau \text{ y es máximo local en una vecindad}\}$$

- Típicamente ~3 picos por frame de 10 ms.
- Una canción de 3 minutos → ~50,000 picos.
- La canción **es** este conjunto de puntos — una imagen binaria sparse.

> **Por qué los picos sobreviven al ruido:** El ruido blanco tiene espectro plano: en cualquier ventana corta, agrega aproximadamente la misma cantidad de energía a cada bin. Pero los picos de la señal eran ya varios dB por encima del ruido espectral local. Así que la mayoría sigue siendo máximo local incluso con SNR moderado.

---

### Por qué pares y no picos individuales

**Hash basado en picos individuales:** `(f, t)` es la clave. Problema: con ruido, `f` se desplaza unos bins; el hash cambia y no matchea. Además, en una DB de millones, demasiadas canciones tienen un pico en f = 440 Hz.

**Hash basado en pares:** `(f1, f2, Δt)`.
- Si ambos picos se desplazan por el mismo error de f, la relación es estable.
- La probabilidad de coincidencia casual de un triplete es mucho menor que la de un pico.
- El espacio de hashes es enorme (f1 · f2 · Δt ≈ 10⁸ cubetas), pero cada canción usa solo ~10⁴. Colisiones casuales: raras.

> **La metáfora de Wang:** "Imagina que cada pico es una estrella en el cielo. Una estrella sola no identifica una constelación. Dos estrellas con su distancia angular y orientación, sí."

---

### Construcción de los pares: zona objetivo

Para cada pico ancla `(ta, fa)`, mira los picos siguientes dentro de una **zona objetivo** (rectángulo en el plano `(t, f)`):

```
t (frames)
│
│    [ancla] ───► [zona objetivo]
│
└──────────────────────────────► f (bins)
```

- **Fan-out:** cuántos targets aparear por ancla (típicamente 5).
- Cada par genera un hash `(fa, ft, Δt) = (bina, bint, tt − ta)`.
- También se guarda `ta` para el matching con histograma.

---

## 4 · Matching

### Matching simple: contar hashes coincidentes

**Algoritmo naïve:**

1. Calcula los hashes de la query.
2. Para cada hash, busca en la hash-table de la DB.
3. Cuenta cuántos matches tiene cada canción.
4. La canción con más votos gana.

**Problema:** con DB grande, una canción incorrecta también puede acumular muchos matches casuales. El score absoluto no basta.

**El dilema de la tolerancia:**

| Estrategia | Ventaja | Desventaja |
|---|---|---|
| Tolerancia estricta (matching exacto) | Pocos falsos positivos | Queries ruidosas no matchean |
| Tolerancia laxa (±5 bins) | Más recall | Falsos positivos explotan |

---

### El truco del histograma de offsets temporales

**Observación de Wang:** si la query realmente viene de la canción candidata, todos los matches válidos deberían tener el **mismo offset temporal** Δ = t_db − t_query (= dónde empieza la query dentro de la canción completa).

**Algoritmo robusto:**

1. Para cada hash de query, busca matches en la DB.
2. Para cada match, calcula `Δ = t_db − t_query`.
3. Arma un histograma de Δ por canción.
4. **Score = altura del pico más alto del histograma.**

**Resultado:**
- **Canción correcta:** histograma con pico estrecho y alto (los matches se alinean).
- **Canción incorrecta:** histograma plano y bajo (matches dispersos = ruido).

La discriminación se vuelve enorme.

---

### Visualización del histograma

```
Canción CORRECTA             Canción INCORRECTA
    ▲                            ▲
    │  █                         │  _ _ _ _ _ _ _
    │  █                         │
    │  █                         │
    └──────► Δ                   └──────► Δ
  pico claro ⇒ alineación     nube plana ⇒ matches
     temporal                      dispersos
```

> La altura del pico (canción correcta) puede ser **3–10× más alta** que el segundo lugar, incluso cuando el conteo total de matches es similar.

---

## 5 · Limitaciones

### Lo que el fingerprinting NO puede hacer

Shazam identifica **grabaciones específicas**, no canciones en abstracto.

| Ataque | Por qué falla |
|---|---|
| **Transposición** | Medio tono arriba desplaza todos los picos ⇒ todos los hashes cambian. |
| **Cambio de tempo** | Si la canción se reproduce más rápido, los Δt se escalan. |
| **Covers en vivo** | La 5ª de Beethoven tocada por una orquesta nueva ⇒ fingerprint distinto. |
| **Time-stretching** | El pitch sobrevive pero los Δt cambian. |

**La distinción clave:**

- **Fingerprinting** (Shazam, AcoustID) → responde "¿es esta grabación?"
- **Music similarity** (Spotify Radio, Pandora) → responde "¿qué se parece a esto?" Usa otros métodos: chroma, MFCCs agregados, embeddings neuronales.

---

## 6 · Ritual de Oído y Desafío Relámpago

### Ritual de oído (10 min)

**Clip A — "Cuerda Mágica" (Task 10):** KS con ρ normal vs ρ = 0.9999 (cuerda imposible). ¿Cuál suena a guitarra real, y cuál a drone/granular?

**Clip B — 10 segundos de una canción conocida** con ruido blanco superpuesto a SNR decrecientes:
- ¿A cuántos dB de ruido aún reconocen la canción?
- ¿Qué parte ayuda más a reconocerla: ritmo, melodía o timbre?

> **Conexión auditiva:** el algoritmo de hoy hace algo parecido a lo que su oído hace — aferrarse a los picos más fuertes.

---

### Desafío Relámpago: diseñar el matcher (30 min)

**Tipo:** Diseñar → Implementar → Probar a distintos SNR.

1. Te damos el pipeline armado: STFT + detección de picos + generación de hashes para 3 canciones de referencia.
2. Tu tarea: diseñar la función `match(query_hashes, db_hashes, df_tol, dt_tol)` con tolerancia.
3. Probar a SNR = +20, +10, 0, –5 dB. Documentar a qué SNR rompe.
4. Mejorar: agregar el histograma de offsets. Comparar el margen de victoria con vs sin histograma.

> **La lección:** El conteo simple distingue por margen estrecho. El histograma de offsets distingue por margen **3–10× más amplio**. Ese factor es la diferencia entre "casi funciona" y "funciona en producción".

---

## 7 · Laboratorio Abierto (25 min)

**Pregunta de exploración:**

> "¿Qué feature de bajo nivel discrimina mejor entre música feliz y música triste? Prueben con spectral centroid, ZCR, y tempo en 3 canciones de cada categoría."

**Conexión con investigación:** music emotion recognition es un sub-campo activo de MIR. Los features más efectivos son MFCCs + chroma + tempo + dynamic range. Las redes neuronales (CRNN) son el estado del arte desde 2017, pero hasta hoy ningún modelo supera a un humano para clasificar emoción en una pieza nueva.

**Hipótesis a contrastar (no necesariamente cierta):**
> "Centroide alto + ZCR alto + tempo rápido ⇒ feliz". Sospecha: esto solo funciona para extremos. Para el resto, hace falta el contenido armónico (mayor vs menor).

---

## 8 · Fun Task 11 — Mini-Shazam

### Misión

Implementar un sistema completo de fingerprinting, evaluarlo en una curva precisión-vs-SNR, y — la parte entretenida — **construir tu propia base de datos** con canciones (sintéticas o grabadas) y romperla a propósito para entender los límites del algoritmo.

**Concepts in Action:**
- Peak picking en 2D (espectrograma).
- Hashing geométrico de pares `(f1, f2, Δt)`.
- Hash table como diccionario Python.
- Histograma de offsets para discriminación robusta.
- Evaluación: curva precisión vs SNR.

> **Bonus +10%:** demo en vivo — el script identifica tu canción tocada en tu teléfono.

---

### El reto creativo: "rompe tu Shazam"

1. Construir DB con al menos 3 canciones distintas y reconocibles (puede ser sintetizadas con tus motores de S08/S09/S10, o tomadas de archivos reales).
2. Identificar correctamente queries limpias.
3. Romperlo a propósito y documentar:
   - Subir el ruido hasta SNR donde falla.
   - Transponer la query medio tono arriba.
   - Acelerar la query 5%, 10%, 20%.
   - Aplicar un filtro pasa-bajo agresivo (corte en 1 kHz).
4. Reportar para cada caso: ¿identifica correctamente? ¿Por qué sí o no?

> **Lo que vale el reto:** Entender los límites del algoritmo es más valioso que reproducirlo. La pregunta de la entrega no es "¿funciona?" — es "¿dónde y por qué deja de funcionar?"

---

## 9 · Cierre

### Conexión con lo anterior y lo que viene

**Hacia atrás:**

- **S05 (STFT):** la materia prima de hoy. Sin espectrograma no hay constelación.
- **S07 (modelo sinusoidal):** los mismos picos que allí se usaban para re-sintetizar, aquí se usan como identidad. Mismo objeto, distinta función.
- **S01–S04:** el principio del beating (suma de sinusoides cercanas) explica cómo los matches dispersos en offset suenan a ruido y los alineados suenan a señal.

**Hacia adelante:**

- **S12 (IA generativa — última clase!):** cómo se invierte el problema. En vez de extraer features de audio existente, los modelos de difusión generan audio nuevo a partir de features (texto, espectrograma latente).

---

## Preguntas para pensar hasta la próxima clase

**(a)** ¿Cómo modificarías el fingerprinting para que sea robusto a transposición?
> *Pista:* existen los **relative-pitch hashes**, que codifican intervalos en vez de frecuencias absolutas.

**(b)** ¿Cómo construirías un sistema para detectar si dos canciones distintas usan el mismo riff sampleado? (Búsqueda parcial.)

**(c)** La aplicación **YouTube Content ID** detecta uso indebido de material con derechos. ¿Es esto fingerprinting de Shazam, o algo distinto? ¿Qué desafío adicional tiene?
> *Pista para (c):* Content ID tiene que detectar cualquier fragmento de la canción protegida, en cualquier tonalidad, embebido en otro contenido. El hash table de Shazam no basta. La empresa AcoustID usa una variante con features de chroma que es invariante a transposición.

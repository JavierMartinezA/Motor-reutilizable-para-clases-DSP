# Contenido del curso

Este archivo contiene los textos teóricos, fórmulas LaTeX y captions agrupados
por `slide-id`. El motor lo parsea con anchors `## <id>`. Editar aquí en
lugar de hardcodear strings en JSX.

> Convención: cada slide-id declarado en `course_config.json` debería tener
> una sección `## <id>` aquí (opcional pero recomendado).

---

## example

### Idea
Texto introductorio breve, una o dos frases en cursiva.

### Definición formal
$$
y(t) = \int_{-\infty}^{\infty} h(\tau)\,x(t-\tau)\,d\tau
$$

### Captions
- `step-1`: Caption del paso 1.
- `step-2`: Caption del paso 2.
- `step-3`: Caption del paso 3.

---

## sintesis-clasica

### Idea
Pasamos de **analizar** lo que ya existe a **construir** el sonido: tres familias clásicas — **aditiva** (sumar parciales), **wavetable** (repetir un ciclo con control de fase) y **sustractiva** (espectro denso + filtro que talla el brillo).

### Aditiva
Se eligen frecuencias y amplitudes explícitas; el resultado es la superposición de sinusoides. En la práctica, \(K\) armónicos de una fundamental \(f_0\) bastan para muchos timbres “ordenados”.

$$
x(t)=\sum_{k=1}^{K} A_k\cos\bigl(2\pi k f_0\, t + \phi_k\bigr)
$$

### Wavetable
Se guarda **un periodo** de una forma de onda \(w[n]\) de longitud \(N\). La frecuencia se controla con la velocidad a la que avanza el índice de fase (incremento proporcional a \(f_0/f_s\)).

$$
x[n]=w\bigl[\lfloor \theta[n]\rfloor \bmod N\bigr],\qquad
\theta[n+1]=\theta[n]+\frac{f_0}{f_s}\,N
$$

### Sustractiva
Partimos de una fuente con **mucho contenido espectral** (diente, pulso, ruido…) y aplicamos un filtro lineal \(h\) que atenúa bandas; en frecuencia, la multiplicación por \(H(\omega)\) es la intuición central.

$$
y(t)=(x*h)(t),\qquad Y(\omega)=X(\omega)\,H(\omega)
$$

### Captions (slide)
- **Paso aditivo**: “Parciales como arquitectura del espectro.”
- **Paso wavetable**: “Un ciclo en memoria; la fase camina sobre la tabla.”
- **Paso sustractivo**: “Mucha energía al inicio; el filtro esculpe el brillo.”

---

## sintesis_fm

### Portada - Mecanismo de Generación
La síntesis FM consiste en la modulación de la frecuencia instantánea de una señal portadora mediante una señal moduladora operando en el espectro audible. Este proceso genera componentes espectrales adicionales (bandas laterales) sin necesidad de múltiples osciladores, permitiendo la creación de timbres complejos mediante una interacción no lineal entre señales senoidales.

### El Problema - El Paradigma del DX7
El límite de la Síntesis Aditiva: Emular instrumentos reales sumando sinusoides individuales exige una enorme carga computacional. En 1983, el Yamaha DX7 definió una década logrando espectros inmensamente ricos utilizando únicamente 6 osciladores interactivos. ¿Cómo se genera tal complejidad espectral con tan pocos recursos computacionales?

### La Intuición - Del Vibrato al Timbre
Si aplicamos la salida de un oscilador para modular la frecuencia de otro, el resultado depende estrictamente de la velocidad de esta modulación. Si la frecuencia moduladora ($f_m$) es menor a 20 Hz (el límite inferior de audición humana), el cerebro percibe un LFO clásico: un vibrato donde la altura de la nota ondula en el tiempo.

El salto artístico y perceptivo ocurre al cruzar el umbral psicoacústico de los 20 Hz. Cuando $f_m$ entra en el rango de audio, nuestro oído deja de seguir las variaciones individuales de frecuencia y las fusiona, percibiendo un timbre completamente nuevo. El vibrato desaparece y, en su lugar, nacen bandas laterales espectrales que enriquecen el tono.

### La Ecuación y el Plano 2D (Modulación de Fase)
El corazón de este universo tímbrico se rige por la ecuación fundamental de la modulación:

$$
y(t) = A\sin\bigl(2\pi f_c t + I\sin(2\pi f_m t)\bigr)
$$

Donde:
- $f_c$ es la frecuencia portadora (Carrier), que define la percepción del tono base.
- $f_m$ es la frecuencia moduladora (Modulator), que dicta el espaciado de los armónicos.
- $I$ es el Índice de Modulación, el "cincel" que controla el brillo y la densidad armónica.

**El secreto técnico del DX7:** Aunque lo llamamos FM, el Yamaha DX7 en realidad implementa Modulación de Fase (PM). La derivada de la fase respecto al tiempo es la frecuencia, por lo que modular la fase con un seno es matemáticamente equivalente a modular la frecuencia con un coseno. Yamaha optó por PM porque previene que la portadora sufra de desviación de afinación (pitch drift) si la moduladora tiene un componente DC, garantizando una estabilidad tonal perfecta en todo el teclado.

El timbre vive en un plano bidimensional controlado por el Ratio ($f_m / f_c$) y el Índice $I$.
- **Ratios racionales (ej. 1:1, 1:2)**: Generan espectros armónicos donde las bandas laterales coinciden con la serie armónica natural, produciendo sonidos instrumentales cálidos como maderas o metales.
- **Ratios irracionales o complejos (ej. 1:$\sqrt{2}$, 1:3.14)**: Las bandas caen entre los armónicos, creando batimentos y disonancias que producen texturas inarmónicas características de campanas, gongs y percusiones metálicas.

### Funciones de Bessel y el Abanico Espectral
A medida que el Índice de Modulación ($I$) aumenta desde cero, la energía espectral es "robada" de la portadora y se transfiere a un número creciente de frecuencias laterales (sidebands) situadas en $f_c \pm nf_m$. La distribución exacta de esta energía no es lineal; está regida por las Funciones de Bessel de primera especie, $J_n(I)$.

Sin entrar en derivaciones matemáticas complejas, el impacto acústico de Bessel se resume en la **Regla de Carson para el ancho de banda**:

$$
BW \approx 2f_m(I + 1)
$$

Como regla práctica, el número de bandas laterales significativas audibles a cada lado de la portadora es aproximadamente $I+1$. Cuando las bandas laterales se expanden hacia frecuencias negativas, rebotan en los 0 Hz y se reflejan hacia el dominio positivo con una inversión de fase, generando interferencias constructivas y destructivas que otorgan a la FM su cualidad viva y casi acústica.

### Audio en Vivo (La Revelación del Espectro)
En esta demostración, visualizamos y escuchamos cómo un espectro cobra vida a partir de una simple onda senoidal.
- **Armonía controlada**: Fijando el Ratio en 1:1 y aumentando lentamente el índice $I$ de 0 a 10, la energía se expande simétricamente. De una flauta pura (seno) el sonido se abre en un abanico de armónicos hasta convertirse en un denso metal analógico similar a un diente de sierra.
- **Inarmonía**: Al cambiar el Ratio a $\sqrt{2}$ (aprox. 1.414) con el mismo $I$, los parciales ya no se alinean musicalmente. Las frecuencias chocan, generando una textura metálica y compleja, revelando la naturaleza percusiva del algoritmo. Este simple cambio de variable reemplaza por completo la necesidad de un banco de resonadores complejos.

### El Truco del DX7 - Dinámica Tímbrica (Envolventes sobre I)
En la naturaleza, ningún sonido es estático. El golpe de un piano Rhodes o el impacto de un mazo sobre una campana contienen ricas ráfagas de frecuencias agudas en el instante del ataque, las cuales se disipan rápidamente dejando una onda casi pura.

El arte de la síntesis FM radica en no dejar el índice $I$ estático, sino modularlo a través del tiempo con un generador de envolvente (ADSR).
- **Para una campana**: Se configura un $I$ máximo en el ataque (ej. $I=8$) con un decaimiento exponencial. El sonido inicia como un caótico choque de metales inarmónicos y decae hacia un seno puro, simulando la amortiguación natural del metal.
- **Para un piano eléctrico**: La envolvente sobre el modulador es percusiva y muy corta, inyectando un transitorio brillante (el golpe del martillo) que se apaga rápidamente, revelando la cálida fundamental.

### El Caos y los Nulos de Bessel
¿Qué ocurre si empujamos la matemática al extremo? Si aumentamos inmensamente $I$ con un ratio de 1:1, el ancho de banda se vuelve tan amplio y denso que la energía se distribuye de manera casi plana, destruyendo la sensación de altura tonal y aproximando la señal a ruido blanco espectral.

El dato curioso: Existe un momento dramático en las matemáticas de este modelo. Observando las funciones de Bessel, en $I \approx 2.4$, ocurre lo que se conoce como "Nulo de Bessel" (Bessel null). En este índice preciso, $J_0(2.4) \approx 0$, lo que significa que la energía de la frecuencia portadora ($f_c$) desaparece completamente del espectro sonoro. Toda la energía de la fundamental ha sido absorbida por sus armónicos, un efecto psicoacústico fascinante que permite crear texturas "huecas" o ilusiones de resonancia sin utilizar un solo filtro sustractivo.

### Slides registradas (sesión 09 · 7 slides lógicas)
La teoría arriba alimenta a las 7 slides registradas en `course_config.json`.
Cada slide id se enumera junto con la sección teórica que consume:

- `sintesis_fm` (01): Portada · Esculpiendo el Espectro + El Problema · DX7
- `fm_intuicion` (02): La Intuición · Del Vibrato al Timbre
- `fm_ecuacion` (03): La Ecuación y el Plano 2D (Modulación de Fase)
- `fm_bessel` (04): Funciones de Bessel y el Abanico Espectral
- `fm_vivo` (05): Audio en Vivo (La Revelación del Espectro)
- `recreando_80s` (06): Fun Task 09 · Clon FM 2-op de timbres icónicos
- `fm_debate` (07): El Caos y los Nulos de Bessel

---

## pivote_proyecto

### Idea
**De Transfer de Timbre Neuronal a Sound Matching Paramétrico.** El proyecto original proponía replicar el timbre de instrumentos mediante modelos neuronales (RAVE / DDSP). Esa ruta exigía GPU dedicada y operaba sobre parámetros latentes sin interpretación musical directa. El pivote opta por **síntesis FM clásica** (Chowning, 1973): ocho parámetros con significado físico — frecuencia portadora, ratio, índice de modulación, feedback y envolvente ADSR — sobre los cuales un agente puede razonar de forma transparente.

### Justificación
| Eje | Propuesta original (descartada) | Propuesta actual |
|---|---|---|
| Tecnología base | RAVE / DDSP | Síntesis FM clásica (Chowning, 1973) |
| Interpretabilidad | Latente, no musical | Significado físico directo |
| Cómputo requerido | GPU dedicada | CPU only (Intel Core i7) |
| Foco metodológico | Generación neuronal end-to-end | DSP + MIR — núcleo del curso |

> El cambio no fue retroceso: fue elegir interpretabilidad y alineación con el curso sobre complejidad computacional.

---

## sound_matching_fm

### Idea
**Sound Matching** = dado un audio objetivo, encontrar automáticamente los parámetros del sintetizador que lo repliquen. En síntesis FM esta tarea es difícil porque el espacio paramétrico es **no lineal y no diferenciable**: pequeños cambios en `ratio` o en el índice de modulación `I` bifurcan el espectro entre un timbre armónico y ruido inarmónico.

### Flujo del problema
$$
\text{Audio objetivo} \;\to\; [\,?\,] \;\to\; \text{Sintetizador FM} \;\to\; \text{Audio sintetizado} \approx \text{objetivo}
$$

### Bifurcación espectral
- Con `fc = 440 Hz` y `ratio = 1.0`, las bandas laterales caen exactamente sobre la serie armónica → timbre **armónico** (madera, órgano).
- Con `ratio = 3.5`, las bandas caen entre armónicos → timbre **inarmónico** (campana, gong).

**Conclusión:** No se puede aplicar gradiente directo → se necesita **optimización de caja negra**.

---

## rl_mdp

### Idea
Reinforcement Learning permite optimizar un sintetizador no diferenciable usando únicamente una **métrica de similitud acústica** como señal de aprendizaje.

### Tabla comparativa

| Método | Limitación principal |
|---|---|
| Algoritmos evolutivos (CMA-ES) | Comienza desde cero ante cada nuevo sonido objetivo |
| Deep Learning supervisado (InverSynth) | Requiere miles de pares (audio, parámetros) etiquetados |
| **RL — este proyecto** | **Solo necesita una métrica de similitud acústica** |

### MDP formal
- **Estado** $s_t \in \mathbb{R}^{54}$: descriptores MIR del audio actual concatenados con los del audio objetivo (no audio crudo).
- **Acción** $\theta = (f_c,\, \text{ratio},\, I,\, \text{feedback},\, A,\, D,\, S,\, R)$: los 8 parámetros del sintetizador.
- **Recompensa** $r = f_{\text{sim}}(x_{\text{synth}},\, x_{\text{target}})$: combinación ponderada de distancias STFT y MFCC.

### Algoritmo
**Soft Actor-Critic (SAC)** — política estocástica, espacio de acción continuo, robusto a recompensas escasas.

---

## implementacion_prototipo

### Idea
Tres módulos desacoplados componen el pipeline: el sintetizador (`synth.py`), la función de recompensa (`reward.py`) y el entorno Gym (`env.py`). El agente SAC interactúa con el entorno por episodios de 50 pasos.

### Sintetizador (`synth.py`)
2 operadores FM al estilo Chowning, envolvente ADSR completa, feedback en el modulador, NumPy puro, `sr = 22050 Hz`, duración `1 s`.

$$
x(t) = A(t)\,\sin\!\bigl(2\pi f_c t + I(t)\sin(2\pi f_m t + \beta\, y_{n-1})\bigr)
$$

donde `β` es la ganancia de feedback sobre la propia salida del modulador.

### Función de recompensa (`reward.py`)
$$
d = 0.4 \cdot \text{LogSpecMAE} + 0.4 \cdot \text{MFCC\_MAE} + 0.2 \cdot \text{SpecConv}
$$
$$
r = e^{-2.0 \cdot d}
$$

### Entorno (`env.py`)
API Gymnasium, acción continua normalizada a $[-1, 1]^8$, 50 pasos por episodio, termina anticipadamente si $r > 0.95$. **Target fijo por entrenamiento** (validación deliberada del pipeline antes de generalizar).

---

## resultados

### Idea
Tras 200k pasos de entrenamiento contra un target inarmónico (`ratio = 3.5`, `I = 8.0`, `fc = 440 Hz`), el agente converge a una política con **recompensa final $r = 0.294$** — perceptualmente distinta del objetivo.

### Tabla de resultados

| Parámetro | Target | SAC | Resultado |
|---|---|---|---|
| `fc` (Hz) | 440.0 | 432.4 | ✅ Error < 2% |
| `ratio` | 3.5 | 1.0 | ❌ Error = 2.49 |
| `I` | 8.0 | 9.47 | ⚠️ Error = 1.47 |
| **Recompensa final** | — | — | **r = 0.294** |

### Hallazgo central — degeneración de la función de recompensa
El agente encontró un **mínimo local**: `ratio = 1.0` + `I = 9.47` genera un espectro armónico de alta energía que, promediado en MFCC y STFT, produce un MAE comparable al objetivo inarmónico.

> Sonidos distintos → descriptores similares.

Esto confirma empíricamente lo reportado por **Salimi et al. (2024)**: las métricas espectrales globales no discriminan suficientemente.

---

## conclusiones

### Lo que se demostró
- Pipeline completo funcional **end-to-end** en CPU.
- El agente **converge correctamente en pitch** (`fc`).
- La función de recompensa STFT+MFCC genera mínimos locales explotables.
- Las métricas espectrales globales son **condición necesaria pero no suficiente**.

### Hoja de ruta

| Paso | Acción | Objetivo |
|---|---|---|
| **Inmediato** | Agregar F0 vía `pyin` en recompensa | Romper la degeneración del ratio |
| **Corto plazo** | Randomizar target en cada episodio | Política generalizable in-domain |
| **Futuro** | Sonidos reales (dataset NSynth) | Generalización out-of-domain |

---

# Clase 11 — MIR & Audio Fingerprinting (Shazam)

> Objetivos: (1) qué es un descriptor de audio (feature) y cómo deja al
> computador "entender" el sonido; (2) cómo funciona el fingerprinting de
> Shazam a nivel estructural y matemático.

---

## portada_mir

### Idea
*De producir sonido a entenderlo.* Hasta la sesión 10 sintetizábamos y
transformábamos audio; ahora le enseñamos al computador a "escuchar" y extraer
significado semántico de un archivo WAV. La ciencia detrás de Shazam y Spotify.

---

## problema_shazam

### Idea
*El "milagro" de Shazam.* Grabas 10 s de una canción en un bar ruidoso y el
sistema la identifica en ≈3 s comparándola contra **millones** de canciones.

### El reto
- Reconocer sin escuchar la canción completa.
- Superar ruido de fondo y ecualizaciones.
- Sin años de tiempo de cómputo.

### Respuesta rápida
No compara audio muestra a muestra. Compara **huellas digitales**
(*fingerprints*) altamente robustas y comprimidas.

---

## features_audio

### Idea
Para clasificar o entender audio extraemos **features** (descriptores), de bajo
nivel (basados en la señal) y de alto nivel (semánticos).

### Bajo nivel
- **ZCR (Zero-Crossing Rate):** tasa de cruces por cero — mide "ruidosidad".
$$
ZCR = \frac{1}{N-1} \sum_{n=1}^{N-1} \mathbb{I}\{\,\text{sgn}(x[n]) \neq \text{sgn}(x[n-1])\,\}
$$
- **Centroide espectral:** "centro de masa" del espectro, correlacionado con el *brillo*.
$$
C = \frac{\sum_{k} f_k\,|X(k)|}{\sum_{k} |X(k)|}
$$
- **Rolloff espectral:** frecuencia bajo la cual se concentra el 85–95 % de la energía.

### Tabla de referencia
| Sonido | ZCR | Centroide | Comportamiento |
|---|---|---|---|
| Violín (arco, A4) | Bajo | ≈1500 Hz | Tonos armónicos estables |
| Hi-Hat | Muy alto | ≈8000+ Hz | Energía en agudos |
| Voz humana | Bajo/Medio | ≈2000 Hz | Formantes dinámicos |

### Alto nivel
BPM (tempo), tonalidad (key), género, mood. Se construyen **agregando
estadísticamente** los descriptores de bajo nivel (ej. con Machine Learning).

---

## onset_bpm

### Idea
Un **onset** es el inicio de un evento musical (golpe de bombo, ataque de piano).

### Spectral Flux
Se detecta con el *flujo espectral* — la "derivada del espectro" — midiendo la
diferencia de energía positiva entre frames adyacentes:
$$
SF(m) = \sum_{k} \max\bigl(0,\ |X(m,k)| - |X(m-1,k)|\bigr)
$$

### Conexión con el ritmo
Los picos de la *onset novelty* dan pulsos espaciados en el tiempo. Analizando su
periodicidad (autocorrelación o Fourier) el computador deduce el **BPM** y
estructura recomendaciones por energía o *danceability*.

---

## pipeline_shazam

### Idea
*Anatomía de un buscador acústico* (Avery Wang, 2003) — diagrama de bloques.

### Etapas
1. **Audio → STFT:** del dominio del tiempo al tiempo-frecuencia (espectrograma).
2. **Constelación de picos:** máximos locales en vecindarios 2D; la canción se
   vuelve una nube dispersa de puntos (filtramos todo salvo donde $|X(m,k)|$ es pico).
3. **Formación de pares (hashes):** un pico solo es frágil; emparejamos un pico
   *ancla* $(t_1, f_1)$ con un *target* $(t_2, f_2)$ dentro de una zona objetivo.
$$
H = (f_1,\, f_2,\, \Delta t) \ \rightarrow\ (\text{ID\_canción},\, t_1)
$$
4. **Hash table:** búsquedas $O(1)$ contra millones de canciones.

---

## demo_mir

### Idea
*Laboratorio: MIR en el navegador* (port de `demo_mir.html`). Corazón de la clase.

### Guion del presentador
1. **Mini-Shazam en vivo:** "Identificar" con audio original vs ruidoso; ver las barras de score.
2. **Constelación:** picos amarillos emergiendo; slider de *picos por frame* y su trade-off.
3. **Hashes:** pares ancla→target con *target zone* punteada; combinatoria y *fan-out*.
4. **Robustez al ruido:** slider de SNR; el sistema sobrevive hasta ≈ −10/−15 dB.
5. **Features:** ZCR y centroide reaccionando en tiempo real a tono/ruido/percusivo.

---

## histograma_offsets

### Idea
*El truco maestro.* La diferencia entre "casi funciona" y "producción".

### El problema
Contar solo coincidencias de hashes hace explotar los falsos positivos: hashes
espurios coinciden por azar en una DB de millones.

### El filtro espacial
Ante un match calculamos el **offset temporal**:
$$
\Delta t_{\text{offset}} = t_{db} - t_{query}
$$

### El momento "ahá"
- **Canción correcta:** todas las coincidencias válidas comparten el *mismo* offset → **pico de Dirac** en el histograma.
- **Canción incorrecta:** alineaciones aleatorias → **nube plana** (ruido).

> Shazam no busca la canción con más hashes en común, busca la que genere el
> pico más alto en el histograma de offsets.

---

## limites_shazam

### Idea
*Rompiendo nuestro propio Shazam.*

### Fun Task de la semana
Programar un "Mini-Shazam" funcional y medir su curva de **Precisión vs SNR**.

### Puntos ciegos del algoritmo
- **Time-stretching:** $\Delta t$ cambia → destruye los hashes.
- **Pitch-shifting:** $f_1, f_2$ cambian → cambia la "llave" del diccionario.
- **Reverb/eco severo:** picos "fantasma" que ensucian la constelación.

---

## discusion_mir

### Idea
*Q&A y evolución del modelo.* Para debatir con la clase.

### Pregunta 1 — ¿Dos canciones con el mismo fingerprint?
A nivel de hash individual: sí (colisión). Pero la probabilidad de que una
*secuencia* de hashes se alinee temporalmente es astronómicamente baja: el
espacio $f_1 \times f_2 \times \Delta t$ tiene millones de cubetas.

### Pregunta 2 — ¿Y un cover transpuesto un semitono?
El algoritmo de Wang fracasa: los picos cambian de bin de frecuencia absoluta.
La solución moderna — **AcoustID** (MusicBrainz) — usa *Chroma features* (energía
mapeada a las 12 notas, ignorando octava) o **relative-pitch hashes** (guardar la
proporción $f_2/f_1$ en vez de valores absolutos) → robusto a transposiciones.

### Cierre
> El agente actual valida el pipeline. El siguiente paso no requiere cambiar la arquitectura — solo **enriquecer lo que el agente puede escuchar**.

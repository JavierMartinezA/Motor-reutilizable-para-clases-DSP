# Guion de clase · Clase 11 — MIR & Audio Fingerprinting (Shazam)

> Guion del orador para la presentación `mir` (deck activo).
> Cada slide se documenta en cuatro partes:
> **[Texto visible en pantalla]** · **[Animación / clics]** · **[Guion hablado]** · **[Conceptos por si preguntan]**
>
> Patrón transversal — la **rúbrica de 4 criterios** (Wang 2003) es el hilo narrativo:
> se planta con `?` en la slide 04, se llena con ✗ en la 06, con ✓ en la 07–08 y se
> remata completa en la 11. Mantener esa tabla visualmente idéntica en las cuatro.

---

## 01 · portada_mir — "De producir sonido a entenderlo"

**[Texto visible en pantalla]**
- Título: *De producir sonido a **entenderlo*** — MIR & Audio Fingerprinting
- Pregunta del día (caja violeta): **Dado un audio, ¿qué puedo decir sobre él?**
- Arco del curso (timeline, 4 hitos):
  - S07 — Modelo sinusoidal · *CREACIÓN*
  - S08–10 — Substractiva · FM · físico · *CREACIÓN*
  - **S11 — MIR & Fingerprinting · ANÁLISIS ← hoy**
  - S12 — Difusión generativa · *GENERACIÓN*
- Línea de anclaje: **El espectrograma es la materia prima de casi todo MIR.**

**[Animación / clics]**
1. Entra título + subtítulo + timeline (con S11 ya resaltado: el "tú estás aquí").
2. *Clic 1:* aparece la caja violeta con la pregunta del día.
3. *Clic 2:* aparece la línea del espectrograma como hilo conductor.

**[Guion hablado]**
"Bienvenidos a la sesión 11. Hasta la sesión 10, todo este módulo se trató de sintetizar: síntesis aditiva, substractiva, FM, modelado físico... es decir, siempre producíamos sonido a partir de parámetros. 
Hoy vamos a girar la flecha 180 grados. En vez de generar audio desde parámetros, partiremos de un audio y nos preguntaremos: ¿qué información podemos extraer de él? 
Esta es la pregunta central de la disciplina conocida como MIR (Music Information Retrieval), y su caso estrella es resolver el problema de: '¿qué canción es esta?'.
Quiero que se lleven un hilo conductor hoy: casi todo en MIR —ya sea para Spotify, Shazam, cálculo de BPM o recomendaciones— arranca exactamente de la misma representación gráfica: el espectrograma. Lo que cambia entre estos sistemas no es el input, es qué tipo de cálculo hacemos sobre él. En la sesión 12 cerraremos el ciclo con difusión generativa, yendo de nuevo desde características a audio nuevo."

**[Conceptos por si preguntan]**
- **MIR (Music Information Retrieval):** Disciplina que busca extraer información estructurada (ritmo, melodía, instrumentos, género) de señales de audio musical.
- **Espectrograma:** Gráfico que muestra cómo cambia el espectro de frecuencias de una señal a lo largo del tiempo. Es la magnitud al cuadrado de la STFT ($|X(t,f)|^2$).

---

## 02 · problema_shazam — "El problema de Shazam"

**[Texto visible en pantalla]**
- Título: **El problema de *Shazam***
- Las 4 restricciones (siempre visibles, izquierda):
  - `10 segundos` — grabados con el teléfono
  - `Bar ruidoso` — voces, distorsión, EQ
  - `Millones` — tamaño del catálogo
  - `< 3 segundos` — respuesta casi inmediata
- Enfoque ingenuo: *"Correlación cruzada contra cada canción"*
- El muro numérico:
  $$\underbrace{10^{7}}_{\text{canciones}}\times \underbrace{240\,s}_{\text{duración}}\times \underbrace{44100}_{f_s}\approx 10^{14}\ \text{ops/query}$$
- ✓ La idea correcta: comparar **huellas digitales** (fingerprints) — robustas, comprimidas, búsqueda **O(1)**

**[Animación / clics]**
1. Entran título + las 4 restricciones (el "contrato" del problema).
2. *Clic 1 ("Probemos la fuerza bruta"):* aparece la caja roja del enfoque ingenuo.
3. *Clic 2 ("¿Por qué no sirve?"):* aparece la fórmula 10¹⁴ + el veredicto "inviable a escala".
4. *Clic 3 ("La idea correcta"):* aparece la caja verde de los fingerprints.

**[Guion hablado]**
"Viajemos al año 2003. Avery Wang y el equipo de Shazam tenían cuatro restricciones brutales al mismo tiempo: capturar solo 10 segundos, con el pésimo micrófono de un teléfono de la época, en un bar lleno de ruido y ecualizaciones, compararlo contra millones de pistas, y dar una respuesta en menos de 3 segundos.
*(Antes del clic 2)* ¿Qué es lo primero que se le ocurre a un ingeniero de señales? Correlación cruzada. Tomo mi fragmento, lo deslizo sobre cada canción de la base de datos y veo dónde calza mejor. 
Pero miremos los números: 10 millones de canciones por 240 segundos en promedio a 44,100 muestras por segundo... nos da más de $10^{14}$ operaciones por cada consulta. Es inviable. Y lo peor no es el número, sino que cada vez que agregamos canciones, la búsqueda se hace más lenta. Escala con el catálogo.
*(Clic 3)* La idea correcta es invertir el problema: debemos reducir cada canción a una 'huella digital' o fingerprint. Esta huella debe ser robusta al ruido y muy comprimida, de modo que buscar se convierta en una operación O(1), es decir, que tarde lo mismo sin importar si hay mil o diez millones de canciones."

**[Conceptos por si preguntan]**
- **Correlación cruzada:** Operación matemática que mide la similitud entre dos señales mientras una se desliza sobre la otra. Muy cara computacionalmente para señales largas.
- **O(1) o Tiempo constante:** En ciencias de la computación, un algoritmo es O(1) si el tiempo que tarda en ejecutarse no depende del tamaño de los datos de entrada (gracias a estructuras como Hash Tables).

---

## 03 · shazam_teaser — "El sistema en funcionamiento" (pipeline visual)

**[Texto visible en pantalla]**
- Título: **El sistema *en funcionamiento***
- Diagrama de pipeline (imagen `imagen_slide02.png`):
  **Listen → Audio Signal → FFT Spectrum → Peaks → Fingerprint → Matching → Song Found**
- Texto explicativo: *cada etapa transforma la señal: del audio crudo al espectrograma, de ahí a los picos, luego a la huella digital, y finalmente a la búsqueda en la base de datos.*
- Pregunta sembrada (visible, sin responder): **¿Cómo decide a partir de un fragmento corto, sin comparar la grabación completa?**

**[Animación / clics]**
- Sin revelado por pasos: la slide es estática.
- El pipeline se muestra completo desde el inicio — recórrelo etapa por etapa oralmente.

**[Guion hablado]**
"Antes de meternos en fórmulas, quiero que vean el sistema completo en funcionamiento. El pipeline de Shazam tiene básicamente siete pasos: 
Escucha por el micrófono, digitaliza la señal de audio, calcula su espectro usando la FFT, detecta los picos de energía, arma la huella digital, la busca en la base de datos y, finalmente, encuentra la canción.
Iremos descubriendo cada una de estas cajas paso a paso. Pero lo crucial que deben notar ahora es el flujo: desde el micrófono hasta el 'match', hay varias transformaciones y en NINGUNA de ellas se compara la grabación completa. Todo se reduce a comparar la huella comprimida.
Les dejo una pregunta en el aire para que la piensen: ¿Cómo puede el sistema decidir que hay un 'match' perfecto usando solo un fragmento de 10 segundos, sin tener la canción completa para comparar?"

**[Conceptos por si preguntan]**
- **Pipeline:** Una cadena de procesamiento de datos donde la salida de una etapa es la entrada de la siguiente.
- **FFT Spectrum:** El Espectro calculado mediante la Transformada Rápida de Fourier, que nos muestra qué frecuencias están presentes en un bloque de audio.

---

## 04 · bifurcacion — "Una representación, dos tareas" (keystone)

**[Texto visible en pantalla]**
- Título: **Una representación, *dos tareas***
- Tronco común · |STFT|²:
  $$X[k,m]=\sum_n x[n]\,w[n-mH]\,e^{-j2\pi k n/N}$$
  *(rótulos: eje X = tiempo · eje Y = frecuencia)* + espectrograma
- Bifurcación (dos columnas):
  - **DESCRIBIR** — *¿qué tipo de sonido es?* — Spotify, recomendación
  - **IDENTIFICAR** — *¿qué grabación exacta es?* — Shazam, Content ID
- Imagen de bifurcación (`slide_04.png`): refuerza visualmente las dos ramas con íconos
- Rúbrica (4 criterios, columnas DESCRIBIR / IDENTIFICAR con `?`):
  1. Localización temporal
  2. Invariancia traslacional
  3. Robustez al ruido
  4. Entropía / especificidad
- Botón **"Revelar rúbrica"** (ámbar)

**[Animación / clics]**
1. Entra el tronco: fórmula STFT + espectrograma.
2. *Clic 1:* aparecen las columnas DESCRIBIR / IDENTIFICAR + la imagen de bifurcación.
3. *Clic 2:* aparece la tabla de 4 criterios con `?` en ambas columnas.
4. *Clic 3 ("Revelar rúbrica" opcional, o dejarlo al final):* los `?` se desvanecen y entran **✗** (rojo) para DESCRIBIR y **✓** (verde) para IDENTIFICAR.

**[Guion hablado]**
"Esta es una slide clave. El computador nunca recibe 'música'; recibe siempre una matriz matemática de tiempo y frecuencia, es decir, el espectrograma basado en la STFT. Spotify y Shazam parten de exactamente la misma entrada. 
La diferencia fundamental es la pregunta que le hacemos al sistema. 
Por un lado, podemos querer DESCRIBIR: '¿Qué tipo de sonido es?'. Aquí buscamos el género, los BPM, el mood, todo para poder recomendar canciones.
Por otro lado, podemos querer IDENTIFICAR: '¿Qué grabación exacta es?'. Necesitamos encontrar esta toma particular en una base de datos gigante.
Para saber qué método nos sirve, Avery Wang en 2003 propuso cuatro criterios que un buen descriptor debe cumplir. La tesis de hoy es que las herramientas que sirven para DESCRIBIR van a fallar en estos cuatro criterios si intentamos usarlas para IDENTIFICAR. Y eso es lo que forzó a Shazam a inventar su propio camino."

**[Conceptos por si preguntan]**
- **Invariancia traslacional:** La huella debe ser la misma independientemente de si empezamos a grabar en el segundo 10 o en el segundo 45 de la canción.
- **Entropía / Especificidad:** La cantidad de información única que tiene un descriptor. Un valor con baja entropía genera muchos 'falsos positivos' porque muchas canciones lo comparten.

---

## 05 · features_audio — "Describir la textura" (lab)

**[Texto visible en pantalla]**
- Título: **Tarea 1 · *describir* la textura**
- Selector de sonidos: 🎻 armónico · 🥁 percusivo · 📡 ruido · 🗣️ habla
- Forma de onda + envolvente RMS
- Dos fórmulas ancla:
  - ZCR: $\frac{1}{2(N-1)}\sum_n|\mathrm{sgn}\,x[n]-\mathrm{sgn}\,x[n-1]|\,f_s$
  - Centroide (centro de masa): $\mu_f=\dfrac{\sum_k f_k|X_k|}{\sum_k|X_k|}$
- Valores en vivo: ZCR · Centroide · Rolloff · Flatness · RMS
- Reglas de lectura:
  - ZCR alto → percusión/agudos
  - Centroide alto → brillo
  - Flatness ≈ 1 → ruido · ≈ 0 → tonal

**[Animación / clics]**
- Lab manual: cambiar de sonido y pedir predicciones a la audiencia antes de reproducir.

**[Guion hablado]**
"Empecemos por la tarea de DESCRIBIR. Un 'feature' o descriptor es simplemente un número que resume una propiedad de la textura del sonido.
Por ejemplo, el Zero Crossing Rate (ZCR) cuenta cuántas veces la onda cruza el cero por segundo. Sube muchísimo si el sonido es agudo o muy percusivo. 
El Centroide espectral actúa como el centro de gravedad o masa de las frecuencias; es un indicador directo del 'brillo' del sonido. 
La Flatness nos dice si el sonido es más bien ruido (valor cercano a 1) o si es tonal y armónico (cercano a 0).
*(Interactuar con el demo)* Si ponemos este sonido de percusión, ¿cómo creen que será el ZCR? ¿Alto o bajo? (Reproducir sonido). 
Con un puñado de estos descriptores ya podemos clasificar audios usando Machine Learning. Sin embargo, quiero que noten un detalle crítico: todo descriptor aquí es un 'promedio' sobre una ventana de tiempo. En la siguiente slide veremos por qué eso es un problema enorme."

**[Conceptos por si preguntan]**
- **Spectral Rolloff:** Frecuencia bajo la cual se encuentra el 85% de la energía de la señal. Ayuda a distinguir música de voz.
- **Spectral Flatness (Planitud):** Medida de cuán similar es el espectro a un ruido blanco puro.
- **MFCCs (Mel-frequency cepstral coefficients):** Coeficientes que describen la forma general de la envolvente espectral, usando una escala de frecuencias que simula el oído humano (Escala Mel). Se usan mucho en reconocimiento de voz.

---

## 06 · grieta_describir — "¿Por qué Shazam no usa el centroide?"

**[Texto visible en pantalla]**
- Título-pregunta: **¿Por qué Shazam *no* usa el centroide?**
- Experimento mental: *¿Buscarías una grabación con un solo número contra millones?*
- Demostración del desplazamiento:
  - canción limpia → **1200 Hz**  `+ bar →`  + voces/ruido → **1850 Hz**
  - mismo audio, Δ = 650 Hz → **el valor no es reproducible**
- Nota "alto nivel tampoco salva": Flujo Espectral $\mathrm{SF}[m]=\sum_k(|X[k,m]|-|X[k,m-1]|)_+$ → sigue siendo suma agregada
- Rúbrica · columna DESCRIBIR → **✗ en los 4 criterios**
- Qué necesitamos: una representación **local, reproducible y robusta** (Wang 2003)

**[Animación / clics]**
1. Entra la pregunta-título y el experimento (1200 → 1850 Hz).
2. *Clic 1:* aparecen las 4 filas con ✗ rojas en la columna DESCRIBIR.
3. *Clic 2:* aparece la conclusión (local/reproducible/robusto).

**[Guion hablado]**
"Llegamos al momento del quiebre. Si los descriptores son tan buenos, ¿por qué Shazam no los usa para buscar?
Hagamos un experimento mental. El centroide y el ZCR son promedios globales sobre el frame. Y los promedios se contaminan súper fácil. Si la canción limpia tiene un centroide de 1200 Hz, en el momento que alguien habla en el bar, la energía de la voz se suma y el promedio se corre a 1850 Hz.
Es la misma canción, pero el número cambió en 650 Hz. Ya no es reproducible, y si no es reproducible, no me sirve como llave de búsqueda. 
Si revisamos nuestra rúbrica, usar features globales nos da 4 cruces rojas: no hay localización temporal porque un ruido lejano ensucia todo el bloque; no hay invariancia; no hay robustez al ruido; y tiene muy poca entropía, ya que millones de canciones pueden compartir un centroide de 1200 Hz. Ni siquiera descriptores avanzados que detectan el ritmo sirven, porque el ritmo también se distorsiona con el ruido.
Necesitamos lo opuesto a un promedio: una representación local, reproducible y extremadamente robusta."

**[Conceptos por si preguntan]**
- **Flujo Espectral (Spectral Flux):** Mide qué tan rápido cambia el espectro de un frame a otro. Picos en el flujo suelen indicar ataques (onsets) de notas o percusiones.
- **Reproducibilidad:** En este contexto, significa que al extraer características de un audio modificado o ruidoso, obtengamos exactamente los mismos números clave que en el audio original de estudio.

---

## 07 · constelacion_wang — "La constelación de Wang (2003)"

**[Texto visible en pantalla]**
- Título: **La constelación de *Wang (2003)***
- Idea clave: conserva solo los **picos** (máximos locales de energía); descarta el resto del espectrograma
- Por qué resiste: *un pico sobrevive salvo que el ruido lo supere en ESA frecuencia* → insensible a EQ y a amplitud absoluta; importa **dónde**, no cuánto
- Rúbrica IDENTIFICAR → ✓ **Localización temporal** · ✓ **Robustez**
- Módulo `<Constelacion />` (slider picos/frame)

**[Animación / clics]**
- Lab interactivo: mover slider de muchos picos a pocos.

**[Guion hablado]**
"Aquí empieza la magia de IDENTIFICAR. Si el problema es el ruido ambiente ensuciando los promedios, la jugada de Avery Wang fue audaz: tirar a la basura casi todo el espectrograma y quedarse solamente con los picos más fuertes de energía.
¿Por qué solo los picos? Porque un máximo local sobrevive al ruido a menos que el ruido sea más fuerte que la canción *exactamente en esa misma frecuencia y en ese mismo instante*, lo cual es estadísticamente muy raro.
A este sistema ya no le importa la ecualización ni el volumen. No le importa *cuánta* energía hay, sino *dónde* está ubicada geográficamente en el espectrograma. Nuestra canción se acaba de transformar en un mapa de estrellas, una constelación de puntos.
*(Moviendo el slider)* Si guardamos muchos picos, la base de datos explota. El arte es quedarse con los pocos más intensos y aun así lograr identificar. Con esto logramos nuestro primer gran avance: marcamos check verde en Localización temporal y check en Robustez. Nos faltan dos."

**[Conceptos por si preguntan]**
- **Máximo local:** Un punto en el espectrograma (tiempo, frecuencia) que tiene más energía que todos sus vecinos inmediatos alrededor.
- **Ecualización (EQ):** Alterar el balance de frecuencias (ej. subir los bajos). Wang es robusto a EQ porque si los bajos suben, todos los bajos suben por igual y los picos *locales* relativos en los agudos siguen siendo máximos locales.

---

## 08 · hashing_combinatorio — "De picos a hashes — y a O(1)"

**[Texto visible en pantalla]**
- Título: **De picos a *hashes* — y a búsqueda O(1)**
- La llave:
  $$H=(f_1,f_2,\Delta t)\to(\text{ID},\,t_1)$$
- Tres métricas: `≈30 bits` (vs 10 de un pico) · `O(1)` look-up · `10⁶/F²` speedup
- Dos claves:
  - **Δt es relativo** → la llave no cambia según dónde empieces a grabar (invariancia)
  - El hash indexa un **índice invertido** `{H → [(ID,t₁)…]}` → buscar = look-up, no comparación
- Rúbrica IDENTIFICAR → ✓ **Invariancia** · ✓ **Entropía**
- Módulo `<Hashes />` (ancla, fan-out, zona objetivo)

**[Animación / clics]**
- Mostrar cómo un pico se enlaza con targets en una "zona objetivo".

**[Guion hablado]**
"Nos faltan dos checks. Un pico solitario tiene un problema grave: es ambiguo. Un pico en la frecuencia 440Hz (un La) aparece en millones de canciones. 
La genialidad matemática de Shazam fue no guardar picos sueltos, sino combinarlos en pares. Tomamos un pico 'ancla' y lo emparejamos con otros picos cercanos, guardando la frecuencia 1, la frecuencia 2 y la distancia de tiempo entre ellos (Delta T). 
Con esto, pasamos de algo ambiguo a una firma súper específica de unos 30 bits de información.
Y noten esto: usamos la *diferencia* de tiempo entre los picos, no el tiempo absoluto. Por lo tanto, no importa en qué parte de la canción empieces a grabar en el bar, ese Delta T va a ser el mismo. Logramos la 'invariancia'.
Estos tripletes se convierten en llaves para una gran tabla Hash (un índice invertido). Buscar pasa a ser inmediato, es $O(1)$. No comparas señales; buscas una llave exacta en un diccionario. Y así completamos las cuatro ventajas de IDENTIFICAR."

**[Conceptos por si preguntan]**
- **Fan-out:** La cantidad máxima de pares que formamos por cada pico ancla. Suele estar limitado (ej. de 3 a 5 targets) para no sobrecargar la base de datos.
- **Índice invertido:** Estructura de datos idéntica a la que usan los motores de búsqueda (Google), donde en vez de buscar "qué palabras hay en un documento", mapeas "dado este hash (palabra), en qué canciones aparece".
- **Hash Table:** Estructura de programación que asocia llaves (el hash de los 2 picos) a valores (la lista de canciones y los tiempos exactos donde ocurre).

---

## 08b · wang_coherencia — "Coherencia temporal: el histograma de offsets"

**[Texto visible en pantalla]**
- Título: **Coherencia temporal: *el histograma de offsets***
- Fórmula ancla: $\textcolor{\#d97706}{\delta t} = \textcolor{\#7c3aed}{t_{db}} - \textcolor{\#2563eb}{t_{query}}$
- Contexto: *la llave H=(f₁,f₂,Δt) → (ID,t₁) produce matches; se calcula δt para cada uno*
- Dos paneles:
  - **Izquierda (rojo):** `Wang_noMatch.png` — scatterplot sin diagonal + histograma plano (matches casuales)
  - **Derecha (verde):** `Wang_Match.png` — scatterplot con diagonal + pico Dirac (matches de la canción correcta)
- El criterio final no es "más hashes" sino **"pico más alto en el histograma"**

**[Animación / clics]**
1. Mostrar la fórmula y el scatterplot rojo de la izquierda (sin coincidencia).
2. *Clic 1:* aparece el verde a la derecha revelando el "pico".

**[Guion hablado]**
"Pero todavía tenemos un problema: por puro azar, dos canciones distintas pueden compartir algunos hashes. ¿Cómo está completamente seguro Shazam?
El truco final es la coherencia temporal. Por cada 'match' o coincidencia que encontramos, restamos el tiempo donde aparece en la base de datos menos el tiempo de nuestra grabación del celular. 
Si la canción es la incorrecta, las coincidencias fueron azarosas, y esas restas darán números aleatorios, formando una nube desordenada como ven a la izquierda.
Pero si es la canción correcta, TODO calza perfecto. La diferencia de tiempo entre mi celular y la canción de estudio será una constante. En el gráfico de Wang, esto forma una diagonal perfecta. Si lo agrupamos en un histograma, vemos una enorme barra o 'Pico Dirac'.
El criterio final para dar una respuesta al usuario no es simplemente contar quién tuvo más hashes, sino evaluar quién logró armar el pico más alto en este histograma de tiempos."

**[Conceptos por si preguntan]**
- **Coherencia temporal:** El hecho de que si una pista de audio es idéntica a otra, no solo sus espectros coinciden, sino que sus eventos ocurren en el mismo orden y espaciado temporal.
- **Pico Dirac / Impulso de Dirac:** En matemáticas, una función que tiene valor infinito en 0 y es cero en el resto. En gráficos prácticos, es una barra singular y masiva sobresaliendo en el histograma.

---

## 09 · histograma_offsets — "Coherencia temporal en vivo"

**[Texto visible en pantalla]**
- Título: **Coherencia temporal: *el histograma de offsets***
- Fórmula ancla: $\delta t = t_{db}-t_{query}$
- Dos desenlaces:
  - **correcta →** pico (Dirac)
  - **incorrecta →** nube plana
- Módulo `<MiniShazam />` (demo interactiva)

**[Animación / clics]**
- Correr el demo en vivo.

**[Guion hablado]**
"Vamos a ver esto funcionando en vivo. Acabamos de ver el gráfico del paper de Wang. Ahora, ejecutemos nosotros una búsqueda de Shazam.
Fíjense cómo en la canción correcta, la barra verde del histograma se dispara inmensamente hacia arriba, mientras que todas las demás canciones quedan planchadas abajo como ruido de fondo.
Esta es la magia operando detrás. El sistema puede distinguir de forma inequívoca la canción verdadera con apenas 10 segundos de audio."

**[Conceptos por si preguntan]**
- **Ruido de fondo en el histograma:** Los hashes que coincidieron por pura suerte con otras canciones de la base de datos se distribuyen uniformemente a través de todos los tiempos. No forman un pico porque no son la canción buscada.

---

## 10 · limites_shazam — "Robustez y modos de falla"

**[Texto visible en pantalla]**
- Título: **Robustez y *modos de falla***
- Anclaje empírico (Wang 2003): **50% de reconocimiento a −9 dB** para 15 s
- Puntos ciegos (matriz ✓/✗):
  - ✗ Transposición ½ tono — f₁,f₂ saltan de bin → cambia la llave
  - ✗ Cambio de tempo — los Δt se escalan → no calzan
  - ✗ Reverb/eco severo — picos fantasma ensucian la constelación
  - ✓ Lowpass 1 kHz — sobrevive (los graves siguen siendo máximos)
- Módulo `<Ruido />` (slider SNR)

**[Animación / clics]**
- Jugar con el slider de Ruido.
- Mostrar qué rompe el sistema (transposición, tempo).

**[Guion hablado]**
"Ningún algoritmo es perfecto, y la mejor forma de entender cómo funciona algo es tratar de romperlo. 
Wang reportó que su sistema seguía reconociendo audios a -9 dB de SNR. Es decir, ¡cuando el ruido de fondo es casi tres veces más fuerte que la canción misma! ¿Por qué? Porque la geometría de las estrellas de nuestro espectrograma no cambia por culpa del volumen.
¿Qué es lo que sí rompe a Shazam?
Si hacemos un cover y le subimos medio tono, cada pico se mueve de frecuencia. Los hashes cambian enteros, Shazam falla.
Si aceleramos el tempo en un set de DJ, las distancias Delta T se achican, Shazam falla.
Shazam no está diseñado para reconocer melodías; identifica *grabaciones físicas específicas*, como un CD impreso. Pero interesantemente, sobrevive a ecualizaciones extremas, como un pasa-bajos feroz, porque los picos graves no se movieron."

**[Conceptos por si preguntan]**
- **SNR (Signal-to-Noise Ratio):** Relación Señal-Ruido. Se mide en decibeles. Si es negativo (-9 dB), significa que el ruido ambiente tiene mayor intensidad o energía que la señal de interés.
- **Transposición:** Alterar el tono o la nota base (pitch) de todo el audio sin alterar su velocidad.
- **Filtro Pasa-bajo (Lowpass):** Un filtro que permite pasar solo las frecuencias bajas y corta las agudas (como si escucháramos música a través de una pared).

---

## 11 · discusion_mir — "Síntesis y límites" (cierre)

**[Texto visible en pantalla]**
- Título: **Síntesis y *límites***
- Rúbrica COMPLETA: DESCRIBIR **✗ ✗ ✗ ✗** · IDENTIFICAR **✓ ✓ ✓ ✓**
- El precio: **¿Un cover transpuesto medio tono?** → Wang falla: identifica una *grabación*, no una *canción*
- La salida: volver a DESCRIBIR con descriptores invariantes — **Chroma** + **relative-pitch hashes**
  $$H_{\text{rel}}=\left(\tfrac{f_2}{f_1},\ \Delta t\right)\Rightarrow \text{invariante a transposición}$$
- Para debatir (Fun Task):
  - a. Fingerprinting robusto a transposición
  - b. Detectar un riff sampleado: búsqueda parcial
  - c. YouTube Content ID: ¿es Shazam, o algo más?

**[Animación / clics]**
1. Rúbrica completa visible.
2. *Clic 1:* aparece la caja roja (¿Un cover?).
3. *Clic 2:* aparece la salida (Chroma + relative-pitch).
4. *Clic 3:* aparecen las preguntas para debatir.

**[Guion hablado]**
"Para concluir, vemos nuestra rúbrica final. Usar promedios globales fallaba en todo para identificar, pero la aproximación constelar de Shazam logró las 4 palomitas verdes.
Sin embargo, toda elección ingenieril tiene un precio. Por amarrarnos rígidamente a frecuencias absolutas ganamos inmunidad al ruido, pero nos quedamos ciegos ante las versiones en vivo o los covers.
Si quisiéramos identificar covers, tendríamos que volver atrás en el tiempo a la etapa de DESCRIBIR, usando descriptores mucho más avanzados. Por ejemplo, en vez de guardar frecuencias absolutas, podríamos guardar la 'proporción' entre frecuencias ($f_2 / f_1$). Esa proporción se mantiene constante aunque transpongan toda la canción medio tono arriba. Así funciona hoy YouTube Content ID y las bases de datos de acordes Chroma.
Les dejo estas reflexiones y el Fun Task 11. La próxima semana daremos vuelta todo otra vez: si hoy extrajimos información del audio, en la Sesión 12 la Inteligencia Artificial generativa usará información para fabricar audio de la nada. Muchas gracias."

**[Conceptos por si preguntan]**
- **Chroma / Cromagrama:** Un descriptor que agrupa toda la energía de todas las octavas en las 12 clases de notas musicales (Do, Do#, Re, etc). Ideal para extraer acordes sin importar qué tan aguda o grave es la canción.
- **YouTube Content ID:** Sistema de YouTube que no solo identifica la huella de una grabación idéntica (estilo Shazam), sino que usa derivaciones de Chroma y alineación dinámica temporal para detectar melodías pirateadas, incluso si han sido alteradas en velocidad o tonalidad para evadir los derechos de autor.
- **Búsqueda parcial (Sampleo):** Detectar si el fragmento de 2 segundos de una batería de los años 70 está inmerso dentro de un beat moderno de rap de 3 minutos. Requiere técnicas de fingerprinting ultra-locales.

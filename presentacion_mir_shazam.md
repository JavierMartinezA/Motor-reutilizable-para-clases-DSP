# 🎵 Presentación: Music Information Retrieval (MIR) & Audio Fingerprinting

**Curso:** Análisis y Síntesis de Señales Musicales (ASSM)
**Tema:** Clase 11 - MIR y El Algoritmo de Shazam
**Duración:** 20–25 minutos

---

## 🎯 Objetivos de la Sesión
Al finalizar esta presentación, el grupo debe comprender dos ideas centrales:
1. Qué es un descriptor de audio (feature) y cómo nos permite entender el sonido automáticamente.
2. Cómo funciona el algoritmo de *fingerprinting* de Shazam a nivel estructural y matemático (dejando de lado el marketing).

---

## Slide 1 — Portada
**Título:** De Producir Sonido a Entenderlo: MIR & Audio Fingerprinting
**Subtítulo:** ¿Cómo el computador escucha la música? La ciencia detrás de Shazam y Spotify.
*(Notas para el presentador: Dar la bienvenida. Explicar brevemente el giro del curso: hasta la sesión 10 sintetizábamos y transformábamos audio. Hoy, le enseñamos al computador a "escuchar" y extraer significado semántico de un archivo WAV).*

---

## Slide 2 — El Problema
**Título:** El "Milagro" de Shazam
**Contenido:**
* **Escenario:** Pones 10 segundos de una canción con tu celular en un bar ruidoso, o con el sonido del metro de fondo.
* **El reto:** El sistema identifica la canción correcta en $\approx 3$ segundos comparándola contra una base de datos de **millones** de canciones.
* **La pregunta central:** ¿Cómo hace eso sin escuchar la canción completa, superando el ruido, y sin requerir años de tiempo de procesamiento computacional?
* **Respuesta rápida:** No compara el audio muestra a muestra. Compara "huellas digitales" (fingerprints) altamente robustas y comprimidas.

---

## Slide 3 — Descriptores de Audio: Del Bajo al Alto Nivel
**Título:** Extrayendo Significado: Features de Audio
**Contenido:**
Para clasificar o entender audio, extraemos **Features** (descriptores).

**Bajo Nivel (Basados en la Señal):**
* **ZCR (Zero-Crossing Rate):** Tasa de cruces por cero. Mide la "ruidosidad".
    $$ZCR = \frac{1}{N-1} \sum_{n=1}^{N-1} \mathbb{I}\{ \text{sgn}(x[n]) \neq \text{sgn}(x[n-1]) \}$$
* **Centroide Espectral:** El "centro de masa" del espectro. Correlacionado con el *brillo* percibido.
    $$C = \frac{\sum_{k} f_k |X(k)|}{\sum_{k} |X(k)|}$$
* **Rolloff Espectral:** Frecuencia por debajo de la cual se concentra el 85% - 95% de la energía.

| Instrumento / Sonido | ZCR Típico | Centroide Típico | Comportamiento |
| :--- | :--- | :--- | :--- |
| **Violín (Arco, A4)** | Bajo | $\approx 1500$ Hz | Tonos armónicos estables |
| **Hi-Hat** | Muy Alto | $\approx 8000+$ Hz | Energía concentrada en agudos |
| **Voz Humana (Vocal)** | Bajo/Medio | $\approx 2000$ Hz | Formantes dinámicos |

**Alto Nivel (Semánticos):**
* BPM (Tempo), Tonalidad (Key), Género, Mood.
* *Nota clave:* Los descriptores de alto nivel se construyen agregando y analizando estadísticamente los de bajo nivel (ej. usando Machine Learning).

---

## Slide 4 — Onset Detection y el Ritmo
**Título:** Detectando Eventos: Onsets y BPM
**Contenido:**
* **¿Qué es un Onset?** El inicio de un evento musical (el golpe de un bombo, el ataque de un piano).
* **¿Cómo se detecta?** Usando el *Spectral Flux* (Flujo Espectral) o la "derivada del espectro". Se mide la diferencia de energía positiva entre frames adyacentes:
    $$SF(m) = \sum_{k} \max(0, |X(m, k)| - |X(m-1, k)|)$$
* **Conexión con el Ritmo:** Al detectar los picos en la función de *onset novelty*, obtenemos una señal de pulsos espaciados en el tiempo. Analizando la periodicidad de estos pulsos (ej. con autocorrelación o Fourier), el computador puede deducir el **BPM** y estructurar sistemas de recomendación musical basados en energía o *danceability*.

---

## Slide 5 — El Pipeline de Shazam (Avery Wang, 2003)
**Título:** Anatomía de un Buscador Acústico
**Contenido:**
*(Incluir un Diagrama de Bloques simple en la diapositiva)*
1.  **Audio $\rightarrow$ STFT:** Transformada de Fourier de Tiempo Corto. Pasamos del dominio del tiempo al tiempo-frecuencia (Espectrograma).
2.  **Constelación de Picos:** Buscamos máximos locales (picos de energía) en vecindarios 2D (tiempo y frecuencia). Una canción se convierte en una nube dispersa de puntos. Matemáticamente, filtramos todo excepto donde $|X(m, k)|$ es un pico local.
3.  **Formación de Pares (Hashes):** * **¿Por qué no picos sueltos?** Un pico solo es frágil frente al ruido de fondo o ecualizaciones extremas.
    * **La genialidad:** Emparejamos un pico *Ancla* $(t_1, f_1)$ con un pico *Target* $(t_2, f_2)$ dentro de una zona objetivo temporal.
    * **El Hash:** Se crea una tupla invariante al tiempo absoluto de inicio: $H = (f_1, f_2, \Delta t)$, vinculada al tiempo absoluto $t_1$. Geométricamente estable y resistente a cortes.
4.  **Hash Table:** Guardamos $\{H \rightarrow (ID\_Cancion, t_1)\}$ en una base de datos. ¡Las búsquedas ahora son $O(1)$!

---

## Slide 6 — Demo en Vivo ⚡ (El Corazón de la Clase)
**Título:** Laboratorio: MIR en el Navegador
**Contenido (Instrucciones para el Presentador usando `demo_mir.html`):**

1.  **Apertura Inmersiva:** Inicia directamente en la pestaña **"Mini-Shazam en vivo"**. Haz clic en "Identificar" con audio original y luego con audio ruidoso. Muestra las barras de Score. Deja que el grupo vea cómo las barras se mantienen a favor de la canción correcta.
2.  **Constelación:** Cambia a la primera pestaña. Reproduce una melodía. Muestra los picos amarillos emergiendo. Mueve el slider de *picos por frame*; explica el *trade-off* (pocos picos = poca info, demasiados picos = DB gigante y ruido).
3.  **Hashes:** Muestra cómo los picos forman pares (líneas conectando ancla y target) con la *Target Zone* punteada. Explica la combinatoria y el *fan-out*.
4.  **Robustez al ruido:** Juega con el slider de SNR (Signal-to-Noise Ratio). Desafía a la audiencia: *"¿A qué SNR creen que el algoritmo se rompe?"* Baja el SNR lentamente. El sistema suele sobrevivir asombrosamente hasta los **-10 dB** o **-15 dB**.
5.  **Features:** Ve a la pestaña final. Activa sonidos de prueba (tono, ruido, percusivo) y muestra cómo los valores de ZCR y Centroide reaccionan matemáticamente a la física del sonido en tiempo real. Útil para anclar lo visto en el Slide 3.

---

## Slide 7 — El Truco Maestro: Histograma de Offsets
**Título:** La Diferencia entre "Casi Funciona" y "Producción"
**Contenido:**
* Si solo contamos coincidencias de hashes ("Matching Simple"), los falsos positivos explotan en una DB de millones de canciones debido a hashes espurios que coinciden por azar.
* **El filtro espacial:** Cuando hay un match de hash entre la Query (audio del celular) y la DB, calculamos el *Offset Temporal*:
    $$\Delta t_{offset} = t_{db} - t_{query}$$
* **El momento "Ahá":** * Para la **canción correcta**, todas las coincidencias válidas mantendrán la *misma* distancia relativa de tiempo. El histograma de $\Delta t_{offset}$ tendrá un **pico enorme y aislado** (un delta de Dirac).
    * Para una **canción incorrecta**, los hashes que coinciden por casualidad tendrán alineaciones temporales aleatorias. El histograma será una **nube plana** (ruido blanco).
* *Shazam no busca la canción con más hashes en común, busca la canción que genere el pico más alto en el histograma.*

---

## Slide 8 — Fun Task y los Límites del Algoritmo
**Título:** Rompiendo nuestro propio Shazam
**Contenido:**
* **Fun Task de la Semana:** Programar un "Mini-Shazam" funcional y medir su curva de Precisión vs Ruido (SNR).
* **¿Dónde falla Shazam?** Un algoritmo optimizado para grabaciones específicas tiene puntos ciegos intencionales:
    * **Time-Stretching (Cambio de Tempo):** $\Delta t$ cambia, destruyendo los hashes.
    * **Pitch-Shifting (Transposición):** $f_1$ y $f_2$ cambian, cambiando la "llave" del diccionario en la base de datos de manera catastrófica.
    * **Reverb/Eco Severo:** Introduce picos "fantasma" que ensucian la constelación.

---

## Slide 9 — Discusión: Transposición y el Problema de las Colisiones
**Título:** Q&A y Evolución del Modelo
**Contenido (Para debatir con la clase):**
* **Pregunta 1: "¿Es posible que dos canciones distintas tengan el mismo fingerprint?"**
    * *Respuesta:* Sí, a nivel de hash individual (colisión). Pero la probabilidad de que una *secuencia* de hashes se alinee temporalmente (histograma de offsets) en dos canciones distintas es astronómicamente baja. El espacio de hashes ($f_1 \times f_2 \times \Delta t$) tiene millones de "cubetas".
* **Pregunta 2: "¿Qué pasa si cantamos la canción nosotros, o tocamos un cover transpuesto un semitono?"**
    * *Respuesta:* El algoritmo de Wang (Shazam) fracasará. Los picos cambian de bin en frecuencia absoluto.
    * *La Solución Moderna:* Herramientas como **AcoustID** (usado por MusicBrainz) usan *Chroma Features* (energía mapeada a las 12 notas de la escala musical, ignorando la octava) o **Relative-Pitch Hashes** (guardar la proporción $f_2 / f_1$ en lugar de valores absolutos). Esto hace al sistema robusto a transposiciones.

---
*Documento estructurado pedagógicamente para el curso Análisis y Síntesis de Señales Musicales (ASSM).*

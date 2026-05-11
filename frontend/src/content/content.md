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

### Portada - Esculpiendo el Espectro
La síntesis de Modulación de Frecuencia (FM) representa un punto de inflexión donde la matemática pura se convierte en una herramienta poética para esculpir el sonido. A diferencia de la síntesis sustractiva, que esculpe el timbre quitando frecuencias de formas de onda ricas mediante filtros controlados por voltaje, la síntesis FM aborda el diseño sonoro desde un paradigma constructivo y no lineal. Desarrollada por John Chowning en la Universidad de Stanford en 1967, esta técnica demostró que la complejidad espectral no depende de la cantidad de osciladores, sino de la profundidad de su interacción matemática.

### El Problema - El Paradigma del DX7
Antes de 1983, la creación de espectros acústicos realistas (como los metales, campanas o pianos eléctricos) era una tarea titánica y costosa, limitando la expresividad a osciladores de formas de onda básicas (sierras, cuadradas) y filtros. Con la llegada del Yamaha DX7 en 1983, la industria musical experimentó un sismo estético. En lugar de requerir inmensos bancos de filtros y hardware complejo, el DX7 utilizó la modulación de frecuencia para generar espectros infinitamente ricos con solo 6 osciladores puros (senoidales), denominados "operadores". El DX7 definió el sonido de los años 80, aportando los cristalinos pianos eléctricos de "Take My Breath Away" y las texturas percusivas de "When Doves Cry".

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

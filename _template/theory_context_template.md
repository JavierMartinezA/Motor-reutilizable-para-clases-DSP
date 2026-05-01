# Base de Conocimiento Teórico: {{TÍTULO_DOMINIO}}

**Contexto Teórico para Agente IA (Desarrollo de Slides en React/Three.js)**

Este documento contiene la fundamentación matemática y conceptual estricta para el proyecto de visualización sobre {{NOMBRE_CLASE}}, basada exclusivamente en la literatura técnica relevante.

Su propósito es servir como contexto o *RAG (Retrieval-Augmented Generation)* para evitar alucinaciones y mantener la coherencia matemática en los componentes de la interfaz (`Slide<NombreA>.jsx`, `Slide<NombreB>.jsx`, ...).

---

## 1. {{TÍTULO_CONCEPTO_1}} (Slide 0X: {{NOMBRE_CORTO_SLIDE}})

* **Definición / Limitación:** {{Una a dos frases que enmarcan el concepto.}}
* **Mecanismo / Causa raíz:** {{Por qué ocurre — qué propiedad matemática/física lo provoca.}}
  * *Ejemplo numérico:* {{Caso concreto con valores; ej. parámetros típicos del dominio.}}
* **Consecuencia observable:** {{Qué efecto produce en la señal/medición y qué cota tiene.}}

## 2. {{TÍTULO_CONCEPTO_2}} (Slides 0X y 0Y)

Para {{objetivo del bloque}}, se asume que {{hipótesis fundamental, ej. un modelo aproximado}}.

* **Condición / criterio:** {{Inequación o regla simbólica:}}

  $$
  {{ECUACIÓN_CRITERIO}}
  $$
* **Matemática (para `Slide<Nombre>.jsx`):**
  Sean las variables del modelo:
  ${{var_1}} = ...$
  ${{var_2}} = ...$
  ${{var_3}} = ...$

  1. **{{Subpaso 1}}:** {{Descripción breve.}}
     $$
     {{ECUACIÓN_SUBPASO_1}}
     $$

     *(Propiedad: {{rango / dominio / unidad}})*
  2. **{{Subpaso 2}}:** {{Descripción breve.}}
     $$
     {{ECUACIÓN_SUBPASO_2}}
     $$
  3. **{{Subpaso 3}}:** {{Descripción breve.}}
     $$
     {{ECUACIÓN_SUBPASO_3}}
     $$

## 3. {{ALGORITMO_O_PROCESO}} (Slide 0Z: {{NOMBRE_CORTO}})

{{Descripción de alto nivel del algoritmo: qué entrada toma, qué salida produce, intuición de uno o dos párrafos.}}

* **Heurística / regla principal:**
  * {{Regla 1}}
  * {{Regla 2 — incluir tolerancia / umbral aplicado.}}
  * **Resolución de conflictos:** {{Cómo se rompe un empate, prioridades.}}
* **Máquina de Estados / fases:**
  1. **{{Estado A}}:** {{Cuándo ocurre y qué efecto tiene en datos/UI.}}
  2. **{{Estado B}}:** {{Idem.}}
  3. **{{Estado C}}:** {{Idem.}}
* **Detalle de continuidad / interpolación:** {{Si aplica: cómo se evita discontinuidad entre frames/muestras.}}

## 4. {{MODELO_DE_SEÑAL_O_FÓRMULA_GLOBAL}} (Slide 0W: {{NOMBRE_CORTO}})

{{Una frase introductoria que motive el modelo (por qué la naturaleza del problema lo exige).}}

* **Modelo:**

  $$
  {{ECUACIÓN_MODELO_GLOBAL}}
  $$
* **Componente A:**

  * {{Qué representa físicamente.}}
  * {{Cómo se extrae / sintetiza.}}
  * Fórmula: ${{ECUACIÓN_COMPONENTE_A}}$
* **Componente B:**

  * {{Qué representa.}}
  * **Extracción:** {{Procedimiento, dominio (tiempo/frecuencia).}}
  * **Modelado y síntesis:** {{Forma compacta del componente — envolventes, filtros, ruido, etc.}}
* **Ventaja del modelo:** {{Qué transformaciones/análisis adicionales habilita.}}

## 5. Mapeo Algorítmico al Código (Ejemplo Simplificado)

Estructura mental para la IA de cómo se implementan estos conceptos en código (ej. Python):

* **`{{funcion_1}}()`**: {{Qué hace en una línea: entrada → operación → salida.}}
* **`{{funcion_2}}()`**: {{Idem.}}
* **`{{funcion_3}}()`**: {{Idem — incluye estado interno si aplica.}}
* **`{{funcion_4_pipeline}}()`**:
  1. {{Paso 1.}}
  2. {{Paso 2.}}
  3. {{Paso 3.}}
  4. {{Paso 4.}}

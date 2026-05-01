# Rule · React Slide Templates

## WHAT
Reglas para crear nuevas slides React acopladas al motor `<SlideLayout>` /
`<MathFormula>` / `<DSPCanvas3D>` / `<AudioPlayer>` y registradas en
`course_config.json`. Aplica a **cualquier** dominio de procesamiento de audio
(filtros, AM/FM, STFT, codecs, etc.).

## WHY
- Evitar volver a hardcodear contenido en `App.jsx`. La fuente de verdad es el
  config + el registro `slides/index.js`.
- Mantener una estética editorial uniforme (cream/ink, serif Newsreader).
- Garantizar que el ritmo lo controla el profesor (sin timers automáticos),
  porque la slide se proyecta en una sala de clases.
- Habilitar reuso entre cursos: una nueva clase debe ser puro contenido, sin
  tocar el motor.

## HOW

### Estructura mínima de un slide nuevo

1. Copiar `_template/SlideTemplate.jsx` a `src/slides/<id>/Slide.jsx`.
2. Registrar en `src/slides/index.js`:
   ```js
   import SlideX from './<id>/Slide.jsx';
   export const SLIDE_REGISTRY = { 'mi-id': SlideX };
   ```
3. Declarar en `src/config/course_config.json`:
   ```json
   { "id": "mi-id", "label": "Mi Slide", "props": { "audio": "demo.wav" } }
   ```
4. Texto teórico, fórmulas y captions van en `src/content/content.md` bajo el
   anchor `## mi-id`.

### Convenciones obligatorias

- **Cero scroll**: cada slide debe caber sin scroll vertical (proyección).
- **Timers**: prohibido `setTimeout` para avanzar de paso. State `step` se
  mueve solo con click humano del profesor.
- **Audio**: nunca `import file.wav`. Siempre rutas absolutas `/audio/...`
  hacia `public/audio/`. Para sliders rápidos, debounce ~280 ms antes de
  cargar el archivo nuevo.
- **Matemáticas**: usar `<MathFormula t="\\sum..." display />`. Para colorear
  variables incluir `\textcolor{#hex}{...}` dentro del string LaTeX. KaTeX
  va con `trust: true, strict: false` cuando se usen colores hex.
- **Consistencia cromática**: si una variable es ámbar en la fórmula, su
  representación gráfica también lo es. Paleta canónica:
  - azul `#2563eb` = componente principal/determinista
  - rojo `#c0392b` = componente secundario/estocástico/error
  - verde `#16a34a` = nacimiento/aceptación
  - ámbar `#d97706` = advertencia/transición
  - violeta `#7c3aed` = pipeline completo

### Patrón de pasos revelados

Cada card tiene 3 estados visuales:

| Estado    | Border             | Background       | Opacity |
|-----------|--------------------|------------------|---------|
| pending   | `#e0ddd4`          | `#faf9f7`        | 0.35    |
| revealed  | `card.color + 55`  | `card.bg + 88`   | 1       |
| active    | `card.color`       | `card.bg`        | 1       |

El estado `active` es el único que muestra `card.desc`. Los demás solo título
y subtítulo.

### Patrón de panel visual con fade

Cuando el paso cambia: fade-out (260 ms) → swap del `card` → fade-in
(translateY 14px → 0). Implementación canónica en `_template/SlideTemplate.jsx`
en el subcomponente `VisualPanel`.

### Layout estándar

`<SlideLayout>` provee:
- Header con `NN · SECCIÓN` (mono caps tracking 0.2em) y `<h2>` serif.
- `max-w-7xl mx-auto px-8` con `flex-col gap-20`.
- Slot principal (children) y slot opcional `footer` para el botón.

Si necesitas dos columnas, hazlo dentro de `children`:
```jsx
<SlideLayout sectionId="04" sectionLabel="Filtros IIR" title="...">
  <div style={{ display: 'flex', gap: 32 }}>
    {/* izquierda: controles */}
    {/* derecha: visual */}
  </div>
</SlideLayout>
```

### Anti-patrones a rechazar

- ❌ Importar slides nuevos en `App.jsx` directamente.
- ❌ Hardcodear texto teórico en JSX (debe vivir en `content.md`).
- ❌ Usar MathJax o LaTeX a través de imágenes; siempre KaTeX.
- ❌ Levantar fondos negros puros salvo Canvas 3D justificado.
- ❌ Animar transiciones de paso con `setInterval`/`setTimeout`.
- ❌ Importar WAV con `import` (Vite los hashea y rompe el sync hook).

### Checklist al terminar una slide

- [ ] El slide se carga desde `course_config.json` sin tocar el motor.
- [ ] No hay scroll vertical en 1080p y 1440p.
- [ ] Las fórmulas usan `<MathFormula>` y respetan colores con la gráfica.
- [ ] Audio funciona desde `/audio/...` con play/pause manual.
- [ ] Botón de pasos es responsivo y vuelve al estado 0 al final.

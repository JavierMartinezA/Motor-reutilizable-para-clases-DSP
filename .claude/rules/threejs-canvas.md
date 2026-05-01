# Rule · Three.js Canvas (DSPCanvas3D)

## WHAT
Reglas para los canvas 3D que visualizan datos DSP (espectrogramas, mapas de
parciales, superficies tiempo-frecuencia, vectores en plano complejo, etc.).
Todos pasan por el wrapper `<DSPCanvas3D>`, que normaliza cámara, luces y ejes.

## WHY
- Mantener una identidad visual coherente: fondo cream, ejes claros, sin la
  estética "WebGL demo oscuro".
- Evitar reaprender configuración de `@react-three/fiber` por slide.
- Garantizar que el canvas no rompe la legibilidad en proyección de sala
  (alto contraste, tipografía visible desde el fondo del aula).

## HOW

### Convención de ejes (obligatoria)

Para visualizaciones tiempo-frecuencia-magnitud:
- **X = Tiempo** (frames o segundos), izquierda → derecha.
- **Y = Magnitud** (dB o amplitud lineal), abajo → arriba.
- **Z = Frecuencia** (Hz), profundidad creciente hacia el fondo.

Para visualizaciones del plano complejo (e.g. polos/ceros, fasores):
- **X = parte real**, **Y = parte imaginaria**, **Z = magnitud o tiempo**.

### Configuración estándar de cámara

```jsx
<DSPCanvas3D
  cameraPosition={[6, 5, 8]}   // o [7, 5, 7] para vistas más laterales
  fov={40}                      // 40–42; nunca > 50 (deforma)
  background="#f7f5f0"          // cream-canvas, casi idéntico al fondo
>
  ...
</DSPCanvas3D>
```

### Iluminación

- `ambientLight intensity={0.7}` (puede subir a 0.9 si la escena es plana).
- `directionalLight position={[5, 8, 5]} intensity={0.6}`.
- Nunca usar luces de color saturado (queman el cream).

### Ejes y etiquetas

- Usar `<axesHelper>` solo en debug. En producción, dibujar líneas con
  `<Line>` de `@react-three/drei` y etiquetar con `<Html>`.
- Etiquetas siempre en sans-serif (Inter), tamaño legible desde 8 m
  (~14 px en pantalla 1080p).
- Color del eje: `#9e9eb8` (ink-faint). Color de la etiqueta: `#6b6b8a`
  (ink-muted). Nunca blanco ni negro puro.

### Datos vs estructura

Separar siempre:
```jsx
function MyScene({ tracks }) {              // recibe datos como props
  return tracks.map(t => <TrackLine data={t} />);
}

<DSPCanvas3D ...>
  <MyScene tracks={loadedTracks} />
</DSPCanvas3D>
```
La generación de geometría (`new BufferGeometry`, etc.) se hace dentro de
`useMemo` con dependencias en los datos. **No** crear nuevas BufferGeometries
en cada render.

### Auto-rotate

- `OrbitControls autoRotate autoRotateSpeed={0.4}` para vistas sin
  interacción de pasos.
- Desactivar `autoRotate` en slides con state `step` para no marear.

### Performance

- Tope: ≤ 5000 instancias de `<mesh>`. Si se requiere más, usar
  `InstancedMesh`.
- Para nubes de puntos (peaks), preferir `<Points>` con `BufferAttribute`.
- Limitar `frameloop="demand"` cuando la escena es estática y solo cambia al
  presionar un botón. Esto ahorra GPU del laptop del profesor.

### Anti-patrones a rechazar

- ❌ Fondos negros puros (`#000`) o gradientes oscuros sin justificación.
- ❌ Texto en `<Text>` 3D rotando con la cámara (ilegible). Usar `<Html>`.
- ❌ Crear `Geometry`/`Material` dentro del JSX sin `useMemo` (memory leak).
- ❌ `autoRotate` activo cuando el slide tiene pasos manuales del profesor.
- ❌ Cámaras con FOV ≥ 60 (distorsionan ejes ortogonales).
- ❌ Cargar texturas pesadas (> 1 MB) — preferir generar geometría procedural.

### Checklist al añadir un canvas 3D

- [ ] Pasa por `<DSPCanvas3D>` (no `<Canvas>` directo de R3F).
- [ ] Ejes etiquetados según la convención (X tiempo, Y magnitud, Z freq).
- [ ] Fondo cream `#f7f5f0`, sin estética dark.
- [ ] Geometrías memoizadas con `useMemo`.
- [ ] FOV ≤ 50, cámara no más cerca de `[4, 4, 4]`.
- [ ] Si tiene `step`, no usa `autoRotate`.
- [ ] Funciona a 60 fps en una laptop integrada (probar en Intel UHD).

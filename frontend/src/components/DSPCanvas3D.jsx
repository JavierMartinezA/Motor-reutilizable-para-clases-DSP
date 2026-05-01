/**
 * <DSPCanvas3D>
 * =============
 * Wrapper canónico para escenas 3D de visualización DSP. Encapsula Canvas
 * de @react-three/fiber con cámara, luces y fondo cream estandarizados.
 *
 * Props:
 *   cameraPosition  [x, y, z]  default [6, 5, 8]
 *   fov             number      default 40
 *   background      string      default "#f7f5f0"
 *   ambient         number      intensidad ambient   default 0.7
 *   directional     number      intensidad direccional default 0.6
 *   orbitControls   bool|object true para activar OrbitControls; objeto para
 *                              pasar props a `<OrbitControls>`
 *   axes            bool        true → dibuja ejes X/Y/Z con etiquetas
 *   axisLabels      [x, y, z]   default ["t", "Mag", "f"]
 *   children        node        contenido 3D
 *
 * Convenciones (ver .claude/rules/threejs-canvas.md):
 *   X = Tiempo · Y = Magnitud · Z = Frecuencia
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';

const AXIS_COLOR = '#9e9eb8';
const LABEL_COLOR = '#6b6b8a';

function Axes({ labels = ['t', 'Mag', 'f'], length = 5 }) {
  const [lx, ly, lz] = labels;
  return (
    <group>
      <Line points={[[0, 0, 0], [length, 0, 0]]} color={AXIS_COLOR} lineWidth={1} />
      <Line points={[[0, 0, 0], [0, length, 0]]} color={AXIS_COLOR} lineWidth={1} />
      <Line points={[[0, 0, 0], [0, 0, length]]} color={AXIS_COLOR} lineWidth={1} />
      <Html position={[length + 0.2, 0, 0]} center>
        <span style={axisLabelStyle}>{lx}</span>
      </Html>
      <Html position={[0, length + 0.2, 0]} center>
        <span style={axisLabelStyle}>{ly}</span>
      </Html>
      <Html position={[0, 0, length + 0.2]} center>
        <span style={axisLabelStyle}>{lz}</span>
      </Html>
    </group>
  );
}

const axisLabelStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  color: LABEL_COLOR,
  letterSpacing: '0.04em',
  pointerEvents: 'none',
  userSelect: 'none',
};

export default function DSPCanvas3D({
  cameraPosition = [6, 5, 8],
  fov = 40,
  background = '#f7f5f0',
  ambient = 0.7,
  directional = 0.6,
  orbitControls = false,
  axes = false,
  axisLabels,
  children,
  className = 'canvas-3d',
  style,
}) {
  const orbitProps = typeof orbitControls === 'object' ? orbitControls : {};

  return (
    <div className={className} style={{ background, ...style }}>
      <Canvas
        camera={{ position: cameraPosition, fov }}
        gl={{ antialias: true }}
        style={{ background }}
      >
        <ambientLight intensity={ambient} />
        <directionalLight position={[5, 8, 5]} intensity={directional} />
        {axes && <Axes labels={axisLabels} />}
        {children}
        {orbitControls && <OrbitControls {...orbitProps} />}
      </Canvas>
    </div>
  );
}

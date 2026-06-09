/**
 * Clase 11 · MIR & Shazam — Slide 03 · El pipeline de Shazam (teaser visual)
 * ============================================================================
 * Muestra el pipeline completo de Shazam (Listen → Audio Signal → FFT Spectrum
 * → Peaks → Fingerprint → Matching → Song Found) usando la imagen de referencia.
 * Siembra la pregunta clave sin interacción ni demo: el misterio se resuelve en
 * las slides siguientes.
 */

import SlideLayout from '../../components/SlideLayout';
import { INK, INK_MUTED, VIOLET } from '../_mir_shared.jsx';

export default function SlideShazamTeaser() {
  return (
    <SlideLayout
      sectionId="03"
      sectionLabel="MIR · El pipeline"
      title={<>El sistema <em>en funcionamiento</em></>}
      subtitle="El pipeline completo de Shazam: del micrófono al resultado. El mecanismo lo derivamos en las próximas slides."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Pipeline diagram */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '18px 22px',
          border: '1px solid #e8e3d8',
          boxShadow: '0 2px 16px rgba(26,26,46,0.06)',
        }}>
          <img
            src="/imagenes/imagen_slide02.png"
            alt="Pipeline de Shazam: Listen → Audio Signal → FFT Spectrum → Peaks → Fingerprint → Matching → Song Found"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 8,
            }}
          />
        </div>

        {/* Seeded question */}
        <div style={{
          padding: '14px 20px',
          borderRadius: 10,
          background: '#f3eefc',
          borderLeft: `4px solid ${VIOLET}`,
          fontFamily: "'Newsreader', serif",
          fontSize: 17,
          color: INK,
          lineHeight: 1.55,
        }}>
          Cada etapa transforma la señal: del audio crudo al espectrograma, de ahí a los picos,
          luego a la huella digital, y finalmente a la búsqueda en la base de datos.
          {' '}<span style={{ color: INK_MUTED, fontStyle: 'italic' }}>
            La pregunta de hoy: ¿cómo decide a partir de un fragmento corto, sin comparar la grabación completa?
          </span>
        </div>
      </div>
    </SlideLayout>
  );
}

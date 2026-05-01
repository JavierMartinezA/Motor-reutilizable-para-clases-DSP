/**
 * <SlideLayout>
 * =============
 * Shell editorial reutilizable para cualquier slide. Provee:
 *   - Header con identificador (NN · SECCIÓN) y título serif.
 *   - Slot principal (children) con animación de entrada.
 *   - Slot opcional `footer` para botones de avance/control.
 *
 * Props:
 *   sectionId    string  ej. "04"
 *   sectionLabel string  ej. "Filtros IIR"
 *   title        node    string o JSX (puede contener <em> para énfasis)
 *   subtitle     node    opcional, mostrado bajo el título
 *   footer       node    opcional, slot footer (ej. botón paso)
 *   children     node    contenido principal del slide
 */

import { useEffect, useState } from 'react';

export default function SlideLayout({
  sectionId,
  sectionLabel,
  title,
  subtitle,
  footer,
  children,
}) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div
      className="max-w-7xl mx-auto px-8"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        paddingTop: 16,
        paddingBottom: 12,
      }}
    >
      <header className={show ? 'anim-fade-up' : 'opacity-0'}>
        {(sectionId || sectionLabel) && (
          <span className="font-sans text-base tracking-[0.2em] uppercase text-ink-muted font-semibold">
            {sectionId}{sectionId && sectionLabel ? ' · ' : ''}{sectionLabel}
          </span>
        )}
        {title && (
          <h2 className="font-serif text-5xl sm:text-6xl font-500 text-ink mt-1">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="font-serif text-lg text-ink-muted italic mt-2">
            {subtitle}
          </p>
        )}
      </header>

      <section className={show ? 'anim-fade-up delay-2' : 'opacity-0'}>
        {children}
      </section>

      {footer && (
        <footer
          className={show ? 'anim-fade delay-4' : 'opacity-0'}
          style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}

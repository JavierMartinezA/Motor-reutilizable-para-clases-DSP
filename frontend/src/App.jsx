/**
 * App.jsx
 * =======
 * Host config-driven. NO hardcodea slides. Lee:
 *   - src/config/course_config.json   → decks (metadata + lista de slides)
 *   - src/slides/index.js             → registry id → componente
 *
 * MULTI-DECK: cada clase es un "deck" dentro de course_config.decks. El deck
 * activo se elige por el hash de la URL:
 *     https://host/#fm    → deck "fm"
 *     https://host/#mir   → deck "mir"
 *     https://host/       → courseConfig.defaultDeck
 * Así un único deploy sirve todas las clases con URLs estables y distintas.
 *
 * Para añadir/quitar/reordenar slides: editar SOLO course_config.json + el
 * registry. Este archivo es parte del Motor; no debería tocarse al cambiar
 * de clase.
 */

import { useState, useEffect, useCallback } from 'react';
import courseConfig from './config/course_config.json';
import { getSlideComponent } from './slides/index.js';
import { RecorderProvider } from './voice/LiveVoiceContext';

function MissingSlide({ id }) {
  return (
    <div
      className="max-w-3xl mx-auto px-8 py-16"
      style={{ textAlign: 'center', color: '#6b6b8a' }}
    >
      <span className="font-mono text-xs tracking-widest uppercase text-ink-faint">
        Slide no registrada
      </span>
      <h2 className="font-serif text-3xl text-ink mt-2">id: <code>{id}</code></h2>
      <p className="mt-4 font-sans text-sm">
        El id está declarado en <code>course_config.json</code> pero no existe
        en el registro <code>src/slides/index.js</code>. Crea
        <code> src/slides/{id}/Slide.jsx</code> y agrégalo al registro.
      </p>
    </div>
  );
}

function EmptyCourse() {
  return (
    <div
      className="max-w-3xl mx-auto px-8 py-24"
      style={{ textAlign: 'center', color: '#6b6b8a' }}
    >
      <span className="font-mono text-xs tracking-widest uppercase text-ink-faint">
        Boilerplate vacío
      </span>
      <h2 className="font-serif text-4xl text-ink mt-2">
        Aún no hay slides definidas
      </h2>
      <p className="mt-6 font-sans text-sm">
        Edita <code>src/config/course_config.json</code> y agrega entradas a
        <code> slides[]</code>. Luego registra los componentes en
        <code> src/slides/index.js</code>.
      </p>
    </div>
  );
}

/** Lee el id de deck desde el pathname (`/mir`, `/fm`) con fallback. */
function readDeckId() {
  const decks = courseConfig.decks ?? {};
  const fallback = courseConfig.defaultDeck ?? Object.keys(decks)[0];
  if (typeof window === 'undefined') return fallback;

  // Extrae el primer segmento del pathname (ej. "/mir/slide-3" → "mir")
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const pathDeck = pathParts[0];

  if (pathDeck && decks[pathDeck]) return pathDeck;

  // Fallback a query param ?deck=... si existe
  const qp = new URLSearchParams(window.location.search).get('deck');
  if (qp && decks[qp]) return qp;

  return fallback;
}

export default function App() {
  const [deckId, setDeckId] = useState(readDeckId);

  // Cambiar de clase = cambiar el pathname de la URL, sin recargar.
  useEffect(() => {
    const onPopState = () => setDeckId(readDeckId());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const deck = (courseConfig.decks ?? {})[deckId] ?? {};
  const slides = deck.slides ?? [];
  const theme = deck.theme ?? {};
  const course = deck.course ?? {};
  const [current, setCurrent] = useState(0);
  const [slideKey, setSlideKey] = useState(0);

  // Al cambiar de deck, volver a la primera slide.
  useEffect(() => {
    setCurrent(0);
    setSlideKey((k) => k + 1);
  }, [deckId]);

  const total = slides.length;
  const safeCurrent = Math.min(current, Math.max(0, total - 1));
  const activeSlide = slides[safeCurrent];

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= total || idx === safeCurrent) return;
    setCurrent(idx);
    setSlideKey((k) => k + 1);
  }, [safeCurrent, total]);

  const next = useCallback(() => goTo(safeCurrent + 1), [safeCurrent, goTo]);
  const prev = useCallback(() => goTo(safeCurrent - 1), [safeCurrent, goTo]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  if (total === 0) {
    return (
      <RecorderProvider>
        <div className="min-h-screen bg-cream flex flex-col">
          <main className="flex-1"><EmptyCourse /></main>
        </div>
      </RecorderProvider>
    );
  }

  const SlideComponent = getSlideComponent(activeSlide.id);

  return (
    <RecorderProvider>
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 border-b border-border-light">
          {theme.showHeaderTitle !== false && (
            <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-ink-faint">
              {course.title}
            </span>
          )}
          {theme.showSlideCounter !== false && (
            <span className="font-mono text-[11px] text-ink-faint">
              {safeCurrent + 1}<span className="text-border mx-1">/</span>{total}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto py-6">
          <div key={slideKey} className="slide-enter">
            {SlideComponent
              ? <SlideComponent {...(activeSlide.props ?? {})} />
              : <MissingSlide id={activeSlide.id} />}
          </div>
        </main>

        <footer className="border-t border-border-light px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={prev}
              disabled={safeCurrent === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-sm transition-all
                ${safeCurrent === 0
                  ? 'text-border cursor-not-allowed'
                  : 'text-ink-muted hover:text-ink hover:bg-cream-dark active:scale-97'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {theme.showProgressDots !== false && (
              <div className="flex items-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    title={s.label}
                    className={`transition-all duration-300 rounded-full
                      ${i === safeCurrent
                        ? 'w-6 h-1.5 bg-accent-blue'
                        : i < safeCurrent
                        ? 'w-1.5 h-1.5 bg-accent-blue/40 hover:bg-accent-blue/60'
                        : 'w-1.5 h-1.5 bg-border hover:bg-ink-faint'
                      }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={next}
              disabled={safeCurrent === total - 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-sm transition-all
                ${safeCurrent === total - 1
                  ? 'text-border cursor-not-allowed'
                  : 'text-ink-muted hover:text-ink hover:bg-cream-dark active:scale-97'
                }`}
            >
              Siguiente
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </RecorderProvider>
  );
}

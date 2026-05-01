/**
 * <MathFormula>
 * =============
 * Wrapper KaTeX agnóstico de dominio. Reemplaza al antiguo `Math.jsx`.
 *
 * Props:
 *   t          string    expresión LaTeX (sin $ delimitadores)
 *   display    boolean   true → bloque centrado; false → inline
 *   colors     object    { varName: "#hex" } — inyecta \textcolor automático
 *   className  string    extra classes
 *
 * Renderiza con `trust: true, strict: false` para permitir `\textcolor{#hex}{...}`.
 *
 * Ejemplos:
 *   <MathFormula t="x(t) = A\sin(2\pi f t + \phi)" display />
 *   <MathFormula
 *     t="\delta = \frac{1}{2}\frac{\textcolor{#d97706}{\alpha} - \textcolor{#16a34a}{\gamma}}{\textcolor{#d97706}{\alpha} - 2\textcolor{#c0392b}{\beta} + \textcolor{#16a34a}{\gamma}}"
 *     display
 *   />
 */

import katex from 'katex';
import { useMemo } from 'react';

export default function MathFormula({
  t,
  display = false,
  colors = null,
  className = '',
}) {
  const html = useMemo(() => {
    let expr = t;
    if (colors) {
      // Inyección naive: envuelve `\name` en \textcolor para variables solas.
      // Para casos complejos, pasar el LaTeX ya coloreado en `t`.
      for (const [name, hex] of Object.entries(colors)) {
        const rx = new RegExp(`\\\\${name}\\b`, 'g');
        expr = expr.replace(rx, `\\textcolor{${hex}}{\\${name}}`);
      }
    }
    try {
      return katex.renderToString(expr, {
        throwOnError: false,
        displayMode: display,
        trust: true,
        strict: false,
      });
    } catch {
      return expr;
    }
  }, [t, display, colors]);

  const Tag = display ? 'div' : 'span';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Alias retro-compatible con el viejo `<M />`
export const M = MathFormula;

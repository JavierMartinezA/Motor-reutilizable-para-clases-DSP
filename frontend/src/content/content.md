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

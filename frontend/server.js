// SPA server para Render (servicio web `env: node`).
//
// IMPORTANTE: package.json declara "type": "module", así que ESTE archivo
// DEBE ser ESM (import ...). Si se escribe con require() Node crashea al
// arrancar con "require is not defined in ES module scope" y el deploy cae.
//
// Sirve los estáticos de dist/ y reescribe cualquier ruta sin archivo físico
// (ej. /mir, /fm) a index.html para que App.jsx resuelva el deck por pathname.
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const distPath = join(__dirname, 'dist');

// Estáticos: si el archivo existe (JS/CSS/audio/imagen) se sirve directo.
app.use(express.static(distPath));

// Fallback SPA: el resto de rutas sirve index.html. Se usa middleware en vez
// de app.get('*') para ser compatible tanto con Express 4 como con 5
// (en Express 5 el patrón '*' lanza un error de path-to-regexp).
app.use((req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SPA server listening on port ${port}`);
});

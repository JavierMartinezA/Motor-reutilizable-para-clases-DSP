import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde dist/
app.use(express.static(join(__dirname, 'dist')));

// Fallback: todas las rutas no encontradas sirven index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SPA server listening on port ${port}`);
});

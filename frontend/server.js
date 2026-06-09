const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde dist/
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback: todas las rutas no encontradas sirven index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SPA server listening on port ${port}`);
});

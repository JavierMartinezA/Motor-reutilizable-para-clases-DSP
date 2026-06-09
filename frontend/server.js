const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Servir archivos estáticos desde dist/
app.use(express.static(distPath));

// Fallback SPA: cualquier ruta no encontrada sirve index.html
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SPA server listening on port ${port}`);
});

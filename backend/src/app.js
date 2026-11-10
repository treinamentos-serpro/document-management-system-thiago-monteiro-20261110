const express = require('express');
const multer = require('multer');
const documentsRouter = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(documentsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const isTooLarge = error.code === 'LIMIT_FILE_SIZE';
    return response.status(isTooLarge ? 413 : 400).json({
      error: {
        code: isTooLarge ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: isTooLarge ? 'O arquivo excede o limite permitido.' : 'Upload inválido.',
      },
    });
  }

  return response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Não foi possível processar a solicitação.' },
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;

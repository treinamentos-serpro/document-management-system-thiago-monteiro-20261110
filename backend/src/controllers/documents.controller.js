const { defaultOwner } = require('../config/storage');
const documentsService = require('../services/documents.service');

function getOwner(request) {
  const authenticatedOwner = request.user?.id;
  return typeof authenticatedOwner === 'string' && authenticatedOwner.trim()
    ? authenticatedOwner
    : defaultOwner;
}

function upload(request, response) {
  if (!request.file) {
    return response.status(400).json({
      error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo.' },
    });
  }

  const document = documentsService.createDocument({
    id: request.documentId,
    originalName: request.file.originalname,
    size: request.file.size,
    storageName: request.file.filename,
    owner: getOwner(request),
  });

  return response.status(201).json({ data: documentsService.toPublicDocument(document) });
}

function list(request, response) {
  const data = documentsService.listDocuments(getOwner(request));
  return response.status(200).json({ data, count: data.length });
}

function download(request, response, next) {
  const document = documentsService.getDocumentForDownload(request.params.id, getOwner(request));

  if (!document) {
    return response.status(404).json({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
    });
  }

  return response.download(document.storagePath, document.originalName, (error) => {
    if (error && !response.headersSent) {
      next(error);
    } else if (error) {
      response.destroy(error);
    }
  });
}

module.exports = { upload, list, download };
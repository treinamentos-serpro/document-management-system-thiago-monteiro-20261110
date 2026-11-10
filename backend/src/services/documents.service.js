const documentsRepository = require('../repositories/documents.repository');

function createDocument({ id, originalName, size, storageName, owner }) {
  return documentsRepository.create({
    id,
    originalName,
    size,
    storageName,
    owner,
    uploadedAt: new Date().toISOString(),
  });
}

function listDocuments(owner) {
  return documentsRepository.findByOwner(owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(toPublicDocument);
}

function getDocumentForDownload(id, owner) {
  const document = documentsRepository.findById(id);

  if (!document || document.owner !== owner) {
    return null;
  }

  return {
    originalName: document.originalName,
    storagePath: documentsRepository.getStoragePath(document.storageName),
  };
}

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

module.exports = { createDocument, listDocuments, getDocumentForDownload, toPublicDocument };
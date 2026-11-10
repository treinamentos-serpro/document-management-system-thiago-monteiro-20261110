const crypto = require('node:crypto');
const fs = require('node:fs');
const express = require('express');
const multer = require('multer');
const { maxFileSize, storageDirectory } = require('../config/storage');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();

const storage = multer.diskStorage({
  destination(request, file, callback) {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => callback(error, storageDirectory));
  },
  filename(request, file, callback) {
    callback(null, request.documentId);
  },
});

const upload = multer({ storage, limits: { fileSize: maxFileSize } });

router.post('/upload', (request, response, next) => {
  request.documentId = crypto.randomUUID();
  upload.single('file')(request, response, next);
}, documentsController.upload);

router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

module.exports = router;
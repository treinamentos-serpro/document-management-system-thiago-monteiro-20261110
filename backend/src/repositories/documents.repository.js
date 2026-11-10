const path = require('node:path');
const { storageDirectory } = require('../config/storage');

const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function findById(id) {
  return documents.get(id) || null;
}

function findByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

function getStoragePath(storageName) {
  return path.join(storageDirectory, path.basename(storageName));
}

module.exports = { create, findById, findByOwner, getStoragePath };
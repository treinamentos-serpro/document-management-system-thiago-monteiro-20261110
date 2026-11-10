const path = require('node:path');

const storageDirectory = process.env.DMS_STORAGE_DIR
  ? path.resolve(process.env.DMS_STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');

const configuredMaxFileSize = Number(process.env.DMS_MAX_FILE_SIZE);
const maxFileSize = Number.isInteger(configuredMaxFileSize) && configuredMaxFileSize > 0
  ? configuredMaxFileSize
  : 10 * 1024 * 1024;

const defaultOwner = process.env.DMS_DEFAULT_OWNER || 'anonymous';

module.exports = { storageDirectory, maxFileSize, defaultOwner };
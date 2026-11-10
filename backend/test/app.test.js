const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const { storageDirectory } = require('../src/config/storage');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download de documentos', async (context) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const formData = new FormData();
  formData.append('file', new Blob(['conteudo de teste'], { type: 'text/plain' }), 'teste.txt');

  let documentId;
  try {
    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    assert.strictEqual(uploadResponse.status, 201);

    const uploaded = (await uploadResponse.json()).data;
    documentId = uploaded.id;
    assert.strictEqual(uploaded.originalName, 'teste.txt');
    assert.strictEqual(uploaded.size, Buffer.byteLength('conteudo de teste'));
    assert.strictEqual(uploaded.owner, 'anonymous');
    assert.ok(uploaded.uploadedAt);
    assert.strictEqual('storageName' in uploaded, false);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    const listing = await listResponse.json();
    const listedDocument = listing.data.find((document) => document.id === documentId);
    assert.ok(listedDocument);
    assert.strictEqual('storageName' in listedDocument, false);
    assert.strictEqual(listing.count, listing.data.length);

    const downloadResponse = await fetch(`${baseUrl}/documents/${documentId}/download`);
    assert.strictEqual(downloadResponse.status, 200);
    assert.match(downloadResponse.headers.get('content-disposition'), /filename="teste.txt"/);
    assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');

    const missingResponse = await fetch(`${baseUrl}/documents/inexistente/download`);
    assert.strictEqual(missingResponse.status, 404);
  } finally {
    if (documentId) {
      await fs.rm(path.join(storageDirectory, documentId), { force: true });
    }
  }
});

test('upload sem arquivo retorna erro de validação', async (context) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
    method: 'POST',
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'FILE_REQUIRED');
});

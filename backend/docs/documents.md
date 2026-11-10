# API de documentos

Base URL padrão: `http://localhost:3000`. A porta pode ser alterada pela variável de ambiente `PORT`.

O backend expõe as rotas abaixo sem o prefixo `/api`. No desenvolvimento, o proxy do Vite recebe chamadas em `/api` e remove esse prefixo antes de encaminhá-las ao backend.

## Configuração e comportamento

- Os arquivos são gravados no filesystem local em `backend/storage`, usando `multer.diskStorage`. `DMS_STORAGE_DIR` pode definir outro diretório.
- O limite padrão de upload é 10 MiB (10.485.760 bytes). `DMS_MAX_FILE_SIZE` define outro limite em bytes.
- Os metadados são mantidos em memória e são perdidos ao reiniciar o backend. Os arquivos no disco permanecem.
- O dono é obtido de `req.user.id` quando um middleware de autenticação o fornece. Sem esse middleware, o valor vem de `DMS_DEFAULT_OWNER`, cujo padrão é `anonymous`.
- Não há autenticação implementada nesta versão. Portanto, sem middleware, todos os clientes usam o mesmo dono padrão.
- A API não filtra os tipos de arquivo nesta versão.

As respostas de erro usam o formato `{ "error": { "code": "...", "message": "..." } }`.

## Enviar documento

### `POST /upload`

Envia um arquivo em `multipart/form-data`. O nome do campo obrigatório é `file`.

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@./relatorio.pdf"
```

Resposta `201 Created`:

```json
{
  "data": {
    "id": "e87b4826-c71e-44af-9f74-23da3c3a9d92",
    "originalName": "relatorio.pdf",
    "size": 2048,
    "owner": "anonymous",
    "uploadedAt": "2026-11-10T12:00:00.000Z"
  }
}
```

Possíveis erros:

| Status | Código | Quando ocorre |
| --- | --- | --- |
| `400 Bad Request` | `FILE_REQUIRED` | A requisição não contém o campo `file` com um arquivo. |
| `400 Bad Request` | `INVALID_UPLOAD` | O Multer rejeita a requisição por um erro de upload diferente do limite de tamanho. |
| `413 Payload Too Large` | `FILE_TOO_LARGE` | O arquivo excede `DMS_MAX_FILE_SIZE` (10 MiB por padrão). |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Ocorre uma falha inesperada durante o processamento ou gravação. |

## Listar documentos

### `GET /documents`

Retorna os documentos do dono associado à requisição, do mais recente para o mais antigo.

```bash
curl http://localhost:3000/documents
```

Resposta `200 OK`:

```json
{
  "data": [
    {
      "id": "e87b4826-c71e-44af-9f74-23da3c3a9d92",
      "originalName": "relatorio.pdf",
      "size": 2048,
      "owner": "anonymous",
      "uploadedAt": "2026-11-10T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

Quando não houver documentos, retorna `200 OK` com `{"data": [], "count": 0}`. A resposta não inclui o nome interno usado para localizar o arquivo no disco.

## Baixar documento

### `GET /documents/:id/download`

Substitua `:id` pelo identificador retornado no upload ou na listagem.

```bash
curl -OJ http://localhost:3000/documents/e87b4826-c71e-44af-9f74-23da3c3a9d92/download
```

Em `200 OK`, a resposta contém os bytes do arquivo e o cabeçalho `Content-Disposition` com o nome original. A opção `-O` salva o arquivo usando o nome informado pelo servidor.

Possíveis erros:

| Status | Código | Quando ocorre |
| --- | --- | --- |
| `404 Not Found` | `DOCUMENT_NOT_FOUND` | O identificador não existe ou o documento pertence a outro dono. |
| `500 Internal Server Error` | `INTERNAL_ERROR` | O arquivo não pode ser lido ou ocorre outra falha inesperada. |

## Verificar disponibilidade

### `GET /health`

Endpoint simples de saúde do processo; não verifica o acesso ao diretório de armazenamento.

```bash
curl http://localhost:3000/health
```

Resposta `200 OK`:

```json
{
  "status": "ok"
}
```
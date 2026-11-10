# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, consultem e baixem seus documentos, mantendo os arquivos no filesystem local e os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos.
- Listagem dos documentos do usuário.
- Download de um documento pelo identificador.
- Associação de cada documento a um usuário.
- Exibição de estados de carregamento, sucesso e erro no uso do sistema.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento de documentos.
- Persistência dos metadados após reiniciar o backend.
- Autenticação e cadastro de usuários, até que sejam especificados separadamente.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo enviado como `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve gerar um identificador único para cada documento. |
| RF-03 | O sistema deve gravar o arquivo em `backend/storage`, usando `multer` com `diskStorage`. |
| RF-04 | O sistema deve registrar em memória o identificador, nome original, tamanho, data de upload e dono do documento. |
| RF-05 | O sistema deve rejeitar requisições de upload sem arquivo e uploads que excedam o limite configurado. |
| RF-06 | O sistema deve listar somente documentos pertencentes ao usuário da requisição. |
| RF-07 | O sistema deve permitir baixar um documento pelo identificador, desde que pertença ao usuário da requisição. |
| RF-08 | O sistema deve responder com erro apropriado quando o documento não existir, não pertencer ao usuário ou não puder ser lido. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem permanecer no filesystem local da aplicação; não usar provedores externos. |
| RNF-02 | Os metadados devem permanecer em memória nesta fase. Reiniciar o processo pode tornar os metadados indisponíveis. |
| RNF-03 | Configurações como porta, diretório de armazenamento e limite de upload devem vir de variáveis de ambiente, com valores padrão documentados. |
| RNF-04 | O backend deve seguir o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-05 | Falhas de validação, persistência ou leitura de arquivos devem ser tratadas nos limites apropriados e não expor detalhes internos ao cliente. |
| RNF-06 | Downloads devem ser enviados como anexos, com nome de arquivo tratado de forma segura. |

## 5. Modelo de dados

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único, preferencialmente UUID. |
| `originalName` | string | Nome original fornecido no upload. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador do usuário dono do documento. |
| `storageName` | string | Nome interno usado para localizar o arquivo no disco; não deve ser exposto na API. |

O repositório mantém os metadados em memória e associa `storageName` ao arquivo dentro de `backend/storage`. O nome original não deve ser usado como caminho de armazenamento.

## 6. Contratos de API

As rotas do backend são `/upload`, `/documents` e `/documents/:id/download`. O frontend acessa a API pelo prefixo `/api`, conforme a configuração do proxy do Vite.

### `POST /upload`

- Entrada: `multipart/form-data`, campo obrigatório `file`.
- Sucesso: `201 Created`, com os metadados públicos do documento.
- Erros: `400 Bad Request` para arquivo ausente ou entrada inválida; `413 Payload Too Large` para arquivo acima do limite; `500 Internal Server Error` para falha inesperada de gravação.

Exemplo de resposta:

```json
{
  "data": {
    "id": "uuid",
    "originalName": "relatorio.pdf",
    "size": 2048,
    "uploadedAt": "2026-11-10T12:00:00.000Z",
    "owner": "user-id"
  }
}
```

### `GET /documents`

- Entrada: identidade do usuário no contexto confiável da requisição.
- Sucesso: `200 OK`, lista dos documentos desse usuário, ordenada por data de upload decrescente.
- Resposta: `{ "data": [], "count": 0 }` quando não houver documentos.

### `GET /documents/:id/download`

- Sucesso: `200 OK`, conteúdo binário como anexo, com `Content-Disposition` seguro.
- Erros: `404 Not Found` se o documento não existir ou não pertencer ao usuário; `500 Internal Server Error` para falha de leitura.

### Formato de erro

As respostas de erro devem usar JSON consistente, por exemplo: `{ "error": { "code": "FILE_REQUIRED", "message": "Envie um arquivo." } }`. Não retornar caminhos locais nem stack traces.

## 7. Decisões arquiteturais e riscos

- `routes/` registra endpoints e delega aos controllers; `controllers/` valida a entrada e traduz resultados para HTTP; `services/` aplica regras de negócio; `repositories/` gerencia arquivos locais e metadados em memória.
- O middleware de upload com `multer.diskStorage` grava em `backend/storage`; a lógica de negócio não deve depender diretamente de detalhes HTTP.
- A identidade do dono deve vir de um contexto confiável da requisição, não de um campo livre enviado pelo cliente. Como autenticação não está especificada, o mecanismo que popula esse contexto precisa ser definido antes da implementação.
- Como os metadados são voláteis, após reinício podem existir arquivos sem registro associado. A limpeza desses arquivos não está incluída no MVP.
- O limite de upload e a política de tipos de arquivo precisam ser definidos por configuração ou decisão de produto antes da implementação. O backend deve, no mínimo, rejeitar arquivo ausente e excedente ao limite.

## 8. Plano de execução

1. Criar e revisar esta especificação, definindo o escopo do MVP, os requisitos, os dados, os contratos e as restrições arquiteturais. **Arquivo desta etapa:** `docs/specs/dms-spec.md`.
2. Validar os contratos, códigos de erro e regras de propriedade dos documentos antes de iniciar a implementação.
3. Após aprovação da especificação, planejar separadamente as etapas de implementação. A execução de arquivos de backend e frontend não faz parte deste plano.

## 9. Critérios de aceite desta etapa

- Este documento contém objetivo, escopo, requisitos funcionais e não funcionais, modelo de dados, contratos de API, decisões arquiteturais, riscos e plano de execução.
- A especificação respeita a arquitetura em camadas e o armazenamento local com `multer.diskStorage`.
- Nenhum arquivo de implementação do backend ou frontend é alterado nesta etapa.
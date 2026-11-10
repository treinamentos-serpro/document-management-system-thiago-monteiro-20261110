---
description: Cria arquivo md com documentação de uso das apis de backend
name: scaffold-documentacao-backend
argument-hint: nome do recurso (ex. documents)
agent: agent
---

# Scaffold de camada do backend

Crie ou atualize a documentação de uso das apis de backend incluindo exemplos com o comando curl e os possíveis retornos de cada url. Se utilize do  arquivos listados abaixo para identificar os principais pontos necessários para a documentação:

1. `routes/${input:recurso}.routes.js` - define os endpoints e delega ao controller.
2. `controllers/${input:recurso}.controller.js` - trata entrada/saída HTTP e validação básica.
3. `services/${input:recurso}.service.js` - concentra as regras de negócio.

Gere os arquivos em `backend/docs` com o nome do recurso, por exemplo `backend/docs/documents.md`.

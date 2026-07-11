# Documentação Técnica — API de Tarefas (Estudo)

Este repositório implementa uma pequena API REST para gerenciar tarefas (Tasks). O objetivo desta documentação é servir tanto como material acadêmico (explicações, fluxo e decisões técnicas) quanto como guia prático para manutenção e evolução futura.

Resumo curto:
- Pilha: Node.js (ES Modules), Express, SQLite (arquivo local), Zod para validação.
- Arquitetura: camadas (routes → controllers → services → repositories).
- Persistência: SQLite via `sqlite`/`sqlite3` com migração automática em `src/database/migrate.js`.

--------------------------------------------------------------------------------

**Requisitos mínimos**

- Node.js 16+ (recomendo 18+ para suporte sólido a top-level await).
- npm (ou yarn).

--------------------------------------------------------------------------------

**Instalação e execução**

1. Instale dependências:

```bash
npm install
npm install sqlite sqlite3
```

2. Crie um arquivo `.env` (opcional) ou use o fallback da configuração. Exemplo mínimo (`.env`):

```
PORT=3000
```

3. Inicie a aplicação:

```bash
npm start
```

Observações:
- `src/server.js` chama `migrate()` antes de `app.listen`, então a tabela `tasks` será criada automaticamente no arquivo de banco de dados se ainda não existir.
- Se `PORT` não for definido, o processo atual pode tentar iniciar com `undefined` — recomendo adicionar um fallback (`process.env.PORT || 3000`) em `src/config/env.js`.

--------------------------------------------------------------------------------

**Visão geral da arquitetura e fluxo**

Fluxo de execução de uma requisição típica:

1. `server.js` — ponto de entrada; executa migração e inicia o servidor.
2. `app.js` — configura middlewares globais e registra rotas.
3. `routes/TaskRoute.js` — mapeia endpoints para os métodos do controller.
4. `controllers/TaskControll.js` — extrai dados HTTP e chama `TaskService`.
5. `services/TaskService.js` — lógica de negócios (atualmente é uma camada fina que delega ao repository).
6. `repositories/TaskRepository.js` — executa queries no SQLite via `src/database/connection.js`.
7. Resposta é serializada pelo Express com `res.json()`.

Ficheiros principais (resumo):
- `src/app.js` — configura Express e middlewares.
- `src/server.js` — inicia servidor e chama migração.
- `src/config/*` — `env.js`, `cors.js`, `rateLimit.js`.
- `src/routes/TaskRoute.js` — rotas de tarefa.
- `src/controllers/TaskControll.js` — handlers HTTP.
- `src/services/TaskService.js` — regras de negócio.
- `src/repositories/TaskRepository.js` — acesso a dados (SQLite).
- `src/database/connection.js` — cria/retorna conexão SQLite (usa top-level await).
- `src/database/migrate.js` — cria tabela `tasks` se necessário.
- `src/schemas/TaskSchema.js` — validação com Zod.
- `src/middlewares/*` — `auth`, `validation`, `logger`, `error`, `notFound`.

--------------------------------------------------------------------------------

**Banco de dados (SQLite)**

- Conexão: `src/database/connection.js` usa `open({ filename: './src/database/db.sqlite', driver: sqlite3.Database })`.
- Migração: `src/database/migrate.js` executa `CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL)`.
- Observações técnicas:
  - O projeto usa top-level `await` para abrir a conexão; isso exige Node.js moderno e `type: "module"` em `package.json`.
  - O caminho do arquivo é relativo ao diretório em que o processo Node é iniciado. Para maior robustez, recomendo construir o caminho com `new URL('./db.sqlite', import.meta.url)` ou usando `process.cwd()`.

--------------------------------------------------------------------------------

**Endpoints (rotas)**

A rota base é `/tasks` (registrada em `app.js`).

1) Listar todas as tarefas
- Método: GET
- Endpoint: `/tasks`
- Autenticação: não

Exemplo de resposta (200):

```json
[
  {"id": 1, "title": "Estudar Express"},
  {"id": 2, "title": "Exemplo"}
]
```

2) Buscar por ID
- Método: GET
- Endpoint: `/tasks/:id`
- Autenticação: não

Resposta (200) ou (404 se não existir). Se `id` não for numérico retorna 400.

3) Criar tarefa
- Método: POST
- Endpoint: `/tasks`
- Autenticação: sim (middleware `auth.middleware.js`, apenas checa formato `Bearer <token>`)
- Validação: sim (Zod via `validation.middleware.js` — exige `{ title: string }`)
- Resposta: 201 com objeto criado

4) Atualizar tarefa
- Método: PUT
- Endpoint: `/tasks/:id`
- Autenticação: sim
- Validação: sim
- Resposta: 200 com objeto atualizado ou 404 se não existir (com melhoria sugerida — atualmente pode retornar `null` com 200 em alguns casos).

5) Excluir tarefa
- Método: DELETE
- Endpoint: `/tasks/:id`
- Autenticação: sim
- Resposta: 204 No Content em sucesso ou 404 se não existir.

Exemplos `curl`:

```bash
# Listar
curl http://localhost:3000/tasks

# Criar
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer anytoken" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nova tarefa"}'

# Atualizar
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer anytoken" \
  -H "Content-Type: application/json" \
  -d '{"title":"Atualizado"}'

# Excluir
curl -X DELETE http://localhost:3000/tasks/1 -H "Authorization: Bearer anytoken"
```

--------------------------------------------------------------------------------

**Middlewares importantes**

- `auth.middleware.js`: valida presença do header `Authorization: Bearer <token>`; não valida o token em si (apenas formato).
- `validation.middleware.js`: valida body com schema `src/schemas/TaskSchema.js` (Zod).
- `logger.middleware.js`: loga data, método e URL.
- `rateLimit.js`: limita requisições (100 por 15 minutos por IP).
- `error.middleware.js`: middleware global de erro; usa `err.statusCode` quando presente (classe `AppError` em `src/utils/AppError.js`).

--------------------------------------------------------------------------------

**Observações técnicas e problemas detectados**

1. Dependências faltantes para SQLite no `package.json`:
   - Adicionar `sqlite` e `sqlite3` às dependências (ou rodar `npm install sqlite sqlite3`).

2. `PORT` sem fallback:
   - `src/config/env.js` exporta `PORT: process.env.PORT`. Se `PORT` estiver ausente, o servidor pode tentar iniciar com `undefined`.
   - Recomendo `PORT: process.env.PORT || 3000`.

3. Top-level await e versão do Node:
   - `src/database/connection.js` usa `await` no topo. Isso exige Node 16+/ESM.

4. Caminho relativo do arquivo SQLite:
   - `filename: './src/database/db.sqlite'` é relativo ao `cwd`. Para portar/rodar de outros lugares, use caminho absoluto derivado de `import.meta.url`.

5. `PUT /tasks/:id` deve retornar 404 quando a tarefa não existir:
   - Em `TaskControll.handleUpdate` adicionar lógica para lançar `AppError("Tarefa não encontrada", 404)` caso `TaskService.update` retorne `null`.

6. `auth.middleware` não implementa autenticação real — apenas fluxo de exemplo.

7. Documentação original do projeto falava em `data.json` (arquivo) como persistência; a implementação atual usa SQLite. Há uma mistura histórica — mantenha apenas a solução atual (SQLite) ou documente ambas, se necessário.

8. Recomendações gerais:
   - Adicionar `.env.example`.
   - Renomear `TaskControll.js` para `TaskController.js` para seguir convenção.
   - Implementar testes automatizados (Jest / Vitest).
   - Usar linter/formatter (ESLint, Prettier).

--------------------------------------------------------------------------------

**Como contribuir ou modificar (guia rápido para acadêmicos)**

1. Para alterar a estrutura de dados (ex.: adicionar `completed` ou timestamps):
   - Atualize o schema em `src/schemas/TaskSchema.js` (crie schema separado para `create` e `update` se necessário).
   - Atualize a migration em `src/database/migrate.js` (ou crie nova migração manual para alterar tabela).
   - Atualize `TaskRepository` para ler/gravar os novos campos.
   - Atualize controllers e services conforme necessário.

2. Para trocar SQLite por outro banco:
   - Isolar a camada de repository; criar nova implementação que mantenha a mesma interface (`findAll`, `findById`, `create`, `update`, `delete`).

3. Para implementar autenticação real:
   - Substituir `auth.middleware.js` por validação de JWT (`jsonwebtoken`) ou outro mecanismo de sessão.

--------------------------------------------------------------------------------

**Referências rápidas de arquivos**

- `src/server.js` — inicialização e migração
- `src/app.js` — configuração do Express
- `src/routes/TaskRoute.js` — rotas
- `src/controllers/TaskControll.js` — handlers
- `src/services/TaskService.js` — lógica de negócio
- `src/repositories/TaskRepository.js` — acesso a dados (SQLite)
- `src/database/connection.js` — conexão SQLite
- `src/database/migrate.js` — criação de tabela
- `src/schemas/TaskSchema.js` — validação de entrada via Zod
- `src/middlewares` — autenticação, validação, logs, erros

--------------------------------------------------------------------------------

Se quiser, eu aplico automaticamente as correções não invasivas recomendadas (adicionar fallback de `PORT` em `src/config/env.js`, atualizar `package.json`/instalar `sqlite` e `sqlite3`, ajustar `PUT` para retornar 404 quando apropriado e tornar o caminho do DB mais robusto). Quer que eu aplique essas mudanças agora? 

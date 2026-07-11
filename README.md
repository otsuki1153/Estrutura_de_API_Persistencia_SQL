# Documentacao Tecnica - API de Tarefas com Persistencia SQL

Este documento explica o funcionamento completo desta API de tarefas. Ele foi escrito com foco academico, para ajudar nos estudos de Back-end, arquitetura em camadas, fluxo HTTP, middlewares, validacao, tratamento de erros e persistencia com SQLite.

A API foi construida com Node.js, Express e SQLite. Ela permite criar, listar, buscar, atualizar e excluir tarefas usando rotas REST.

---

## Sumario

1. [Visao geral](#1-visao-geral)
2. [Tecnologias utilizadas](#2-tecnologias-utilizadas)
3. [Estrutura do projeto](#3-estrutura-do-projeto)
4. [Fluxo visual da aplicacao](#4-fluxo-visual-da-aplicacao)
5. [Inicializacao do servidor](#5-inicializacao-do-servidor)
6. [Configuracao do Express](#6-configuracao-do-express)
7. [Banco de dados SQLite](#7-banco-de-dados-sqlite)
8. [Rotas da API](#8-rotas-da-api)
9. [Middlewares](#9-middlewares)
10. [Controller](#10-controller)
11. [Service](#11-service)
12. [Repository](#12-repository)
13. [Validacao com Zod](#13-validacao-com-zod)
14. [Tratamento de erros](#14-tratamento-de-erros)
15. [Exemplos de uso](#15-exemplos-de-uso)
16. [Codigos HTTP](#16-codigos-http)
17. [Pontos de atencao](#17-pontos-de-atencao)
18. [Melhorias futuras](#18-melhorias-futuras)
19. [Resumo academico](#19-resumo-academico)

---

## 1. Visao geral

Esta API gerencia uma entidade chamada `Task`, ou seja, uma tarefa.

Modelo atual de uma tarefa:

```json
{
  "id": 1,
  "title": "Estudar Express"
}
```

A API implementa as operacoes basicas de CRUD:

| Operacao | Significado | Endpoint principal |
|---|---|---|
| Create | Criar tarefa | `POST /tasks` |
| Read | Ler/listar tarefas | `GET /tasks` e `GET /tasks/:id` |
| Update | Atualizar tarefa | `PUT /tasks/:id` |
| Delete | Excluir tarefa | `DELETE /tasks/:id` |

---

## 2. Tecnologias utilizadas

O projeto utiliza as seguintes tecnologias:

| Tecnologia | Funcao no projeto |
|---|---|
| Node.js | Ambiente de execucao JavaScript no Back-end |
| Express | Framework para criar servidor HTTP e rotas |
| SQLite | Banco de dados SQL local em arquivo |
| sqlite / sqlite3 | Bibliotecas usadas para conectar o Node.js ao SQLite |
| Zod | Validacao dos dados recebidos no corpo da requisicao |
| dotenv | Leitura de variaveis de ambiente do arquivo `.env` |
| cors | Controle de acesso entre diferentes origens |
| helmet | Cabecalhos de seguranca HTTP |
| express-rate-limit | Limite de requisicoes por periodo |

Trecho importante do `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "sqlite": "^5.1.1",
    "sqlite3": "^6.0.1",
    "zod": "^4.4.3"
  }
}
```

O campo `"type": "module"` permite usar `import` e `export` no projeto.

---

## 3. Estrutura do projeto

Estrutura principal:

```text
Estrutura_de_API_Persistencia_SQL/
|
|-- src/
|   |-- app.js
|   |-- server.js
|   |
|   |-- config/
|   |   |-- cors.js
|   |   |-- env.js
|   |   |-- rateLimit.js
|   |
|   |-- controllers/
|   |   |-- TaskControll.js
|   |
|   |-- database/
|   |   |-- connection.js
|   |   |-- db.sqlite
|   |   |-- migrate.js
|   |
|   |-- middlewares/
|   |   |-- auth.middleware.js
|   |   |-- error.middleware.js
|   |   |-- logger.middleware.js
|   |   |-- notFound.middleware.js
|   |   |-- validation.middleware.js
|   |
|   |-- repositories/
|   |   |-- TaskRepository.js
|   |
|   |-- routes/
|   |   |-- TaskRoute.js
|   |
|   |-- schemas/
|   |   |-- TaskSchema.js
|   |
|   |-- services/
|   |   |-- TaskService.js
|   |
|   |-- utils/
|       |-- AppError.js
|
|-- package.json
|-- package-lock.json
|-- README.md
|-- .gitignore
```

Observacao sobre nome:

O arquivo `TaskControll.js` funciona normalmente, mas em projetos profissionais o nome mais comum seria `TaskController.js`.

---

## 4. Fluxo visual da aplicacao

Fluxo completo de uma requisicao:

```text
Cliente HTTP
   |
   v
server.js
   |
   |-- executa migrate()
   |-- inicia app.listen()
   v
app.js
   |
   |-- helmet()
   |-- cors()
   |-- express.json()
   |-- loggerMiddleware
   |-- rateLimit
   v
/tasks
   |
   v
TaskRoute.js
   |
   |-- authMiddleware, quando necessario
   |-- validationMiddleware, quando necessario
   v
TaskControll.js
   |
   v
TaskService.js
   |
   v
TaskRepository.js
   |
   v
SQLite - src/database/db.sqlite
   |
   v
Resposta HTTP para o cliente
```

Fluxo simplificado por camadas:

```text
Rotas -> Middlewares -> Controller -> Service -> Repository -> Banco SQL
```

Cada camada tem uma responsabilidade especifica. Isso deixa o codigo mais facil de entender, testar e alterar.

---

## 5. Inicializacao do servidor

Arquivo:

```text
src/server.js
```

Responsabilidades:

- Importar a aplicacao Express.
- Executar a migracao do banco de dados.
- Iniciar o servidor HTTP.
- Encerrar o processo caso ocorra erro na inicializacao.

Trecho principal:

```js
async function startServer() {
    try {
        await migrate();
        app.listen(env.PORT, () => {
            console.log(`Servidor rodando no seguinte link http://localhost:${env.PORT}/`);
        })
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}
```

Ponto importante:

Antes de a API comecar a receber requisicoes, ela chama:

```js
await migrate();
```

Isso garante que a tabela `tasks` exista no banco SQLite.

---

## 6. Configuracao do Express

Arquivo:

```text
src/app.js
```

Esse arquivo cria a aplicacao Express e registra middlewares e rotas.

Ordem de configuracao:

```js
app.use(helmet());
app.use(cors(CorsOPTIONS));
app.use(express.json());
app.use(loggerMiddleware);
app.use(limitOptions);
app.use("/tasks", TaskRoute);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

Explicacao visual:

```text
Requisicao chega
   |
   |-- seguranca com helmet
   |-- regra de CORS
   |-- leitura de JSON
   |-- log da requisicao
   |-- limite de requisicoes
   |-- rotas de /tasks
   |-- rota nao encontrada, se nenhuma rota atender
   |-- tratamento global de erro, se algum erro for lancado
```

A ordem importa. O `notFoundMiddleware` precisa vir depois das rotas, porque ele so deve responder quando nenhuma rota foi encontrada.

---

## 7. Banco de dados SQLite

O projeto usa SQLite, um banco SQL local baseado em arquivo.

Arquivo fisico do banco:

```text
src/database/db.sqlite
```

### Conexao

Arquivo:

```text
src/database/connection.js
```

Trecho principal:

```js
const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
});
```

O caminho do banco e montado assim:

```js
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.sqlite');
```

Isso e positivo porque o banco fica apontando para a pasta `src/database`, independentemente do local onde o comando Node foi executado.

### Migracao

Arquivo:

```text
src/database/migrate.js
```

Esse arquivo cria a tabela `tasks`, caso ela ainda nao exista.

SQL executado:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
)
```

Significado:

| Campo | Tipo | Funcao |
|---|---|---|
| `id` | INTEGER | Identificador unico da tarefa |
| `PRIMARY KEY` | Restricao | Define `id` como chave primaria |
| `AUTOINCREMENT` | Regra | Gera IDs automaticamente |
| `title` | TEXT | Titulo da tarefa |
| `NOT NULL` | Restricao | Impede titulo nulo |

---

## 8. Rotas da API

Arquivo:

```text
src/routes/TaskRoute.js
```

Como as rotas sao registradas em `app.js` com:

```js
app.use("/tasks", TaskRoute);
```

Todas as rotas deste arquivo comecam por `/tasks`.

| Metodo | Endpoint | Auth | Validacao | Controller |
|---|---|---:|---:|---|
| GET | `/tasks` | Nao | Nao | `handleGetAll` |
| GET | `/tasks/:id` | Nao | Nao | `handleGetById` |
| POST | `/tasks` | Sim | Sim | `handleCreate` |
| PUT | `/tasks/:id` | Sim | Sim | `handleUpdate` |
| DELETE | `/tasks/:id` | Sim | Nao | `handleDelete` |

Rotas no codigo:

```js
route.get("/", TaskControll.handleGetAll.bind(TaskControll));
route.get("/:id", TaskControll.handleGetById.bind(TaskControll));
route.post("/", authMiddleware, validationMiddleware, TaskControll.handleCreate.bind(TaskControll));
route.put("/:id", authMiddleware, validationMiddleware, TaskControll.handleUpdate.bind(TaskControll));
route.delete("/:id", authMiddleware, TaskControll.handleDelete.bind(TaskControll));
```

O uso de `.bind(TaskControll)` garante que o `this` continue apontando corretamente para a instancia do controller.

---

## 9. Middlewares

Middlewares sao funcoes executadas entre a requisicao do cliente e a resposta final.

```text
Cliente -> Middleware 1 -> Middleware 2 -> Controller -> Resposta
```

### auth.middleware.js

Valida se a requisicao possui header de autorizacao no formato:

```http
Authorization: Bearer algum-token
```

O middleware verifica:

- Se o header existe.
- Se possui duas partes separadas por espaco.
- Se o tipo e `Bearer`.
- Se o token nao esta vazio.

Ponto academico importante:

Essa autenticacao e apenas uma simulacao. O token nao e validado contra chave secreta, banco de dados ou JWT.

### validation.middleware.js

Valida o corpo da requisicao usando o schema de `TaskSchema.js`.

Se o body for invalido, retorna HTTP 400.

Se for valido, substitui:

```js
req.body = result.data;
```

Assim, o controller recebe dados ja tratados.

### logger.middleware.js

Registra no console a data, o metodo HTTP e a URL:

```text
[11/07/2026 GET /tasks]
```

### notFound.middleware.js

Executado quando nenhuma rota corresponde a requisicao.

Retorna:

```json
{
  "error": "Rota nao encontrada"
}
```

### error.middleware.js

Centraliza o tratamento de erros da aplicacao.

Ele usa:

```js
res.status(err.statusCode || 500)
```

Ou seja:

- Se o erro tiver `statusCode`, usa esse codigo.
- Se nao tiver, retorna HTTP 500.

---

## 10. Controller

Arquivo:

```text
src/controllers/TaskControll.js
```

O controller e responsavel pela comunicacao HTTP.

Ele conhece:

- `req.params`
- `req.body`
- `res.json`
- `res.status`
- `next(error)`

Ele nao deve concentrar acesso ao banco de dados diretamente.

### handleGetAll

Busca todas as tarefas:

```js
const Objlist = await TaskService.getAll();
res.json(Objlist);
```

Resposta esperada:

```http
200 OK
```

### handleGetById

Converte o `id` da URL:

```js
const ParamId = parseInt(req.params.id);
```

Se o ID nao for numerico:

```js
throw new AppError("ID invalido", 400);
```

Se a tarefa nao existir:

```js
throw new AppError("Tarefa nao encontrada", 404);
```

### handleCreate

Cria uma nova tarefa:

```js
const { title } = req.body;
const PostedOBJ = await TaskService.create(title);
res.status(201).json(PostedOBJ);
```

Resposta esperada:

```http
201 Created
```

### handleUpdate

Atualiza uma tarefa existente:

```js
const AlteredOBJ = await TaskService.update(JSONbody, ParamId);
```

Se o repository retornar `null`, o controller gera erro 404.

### handleDelete

Remove uma tarefa:

```js
const ItemDeleted = await TaskService.delete(ParamId);
```

Se a remocao for bem-sucedida, retorna:

```http
204 No Content
```

---

## 11. Service

Arquivo:

```text
src/services/TaskService.js
```

O service fica entre o controller e o repository.

Fluxo:

```text
Controller -> Service -> Repository
```

Atualmente, essa camada e fina e apenas delega chamadas:

```js
async getAll() {
    return await TaskRepository.findAll();
}
```

Mesmo assim, ela e importante porque no futuro pode receber regras de negocio, como:

- Impedir tarefas duplicadas.
- Criar campo `createdAt`.
- Criar campo `completed`.
- Validar regras de usuario.
- Aplicar filtros e paginacao.

---

## 12. Repository

Arquivo:

```text
src/repositories/TaskRepository.js
```

O repository e a camada responsavel por falar com o banco de dados.

Fluxo:

```text
Service -> Repository -> SQLite
```

### findAll

```js
const tasks = await db.all('SELECT * FROM tasks');
```

Retorna todas as tarefas.

### findById

```js
const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
```

Busca uma tarefa pelo ID.

O uso de `?` com array `[id]` ajuda a evitar SQL injection, porque os valores sao enviados como parametros.

### create

```js
const result = await db.run('INSERT INTO tasks (title) VALUES (?)', [title]);
return this.findById(result.lastID);
```

Insere uma tarefa e depois busca a tarefa criada pelo ID gerado pelo SQLite.

### update

```js
await db.run('UPDATE tasks SET title = ? WHERE id = ?', [data.title, id]);
return this.findById(id);
```

Atualiza o titulo da tarefa e depois retorna a tarefa atualizada.

### delete

```js
const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);
return result.changes > 0 ? true : false;
```

Remove uma tarefa e retorna `true` se alguma linha foi afetada.

---

## 13. Validacao com Zod

Arquivo:

```text
src/schemas/TaskSchema.js
```

Schema atual:

```js
const TaskSchema = z.object({
    title: z.string().trim().min(1, "O titulo e Obrigatorio")
});
```

Regras:

| Campo | Tipo | Regra |
|---|---|---|
| `title` | string | Obrigatorio |
| `title` | string | Remove espacos no inicio e fim |
| `title` | string | Precisa ter pelo menos 1 caractere |

Exemplo invalido:

```json
{
  "title": "   "
}
```

Exemplo valido:

```json
{
  "title": "Estudar SQLite"
}
```

---

## 14. Tratamento de erros

Arquivo:

```text
src/utils/AppError.js
```

A classe `AppError` permite criar erros com mensagem e status HTTP.

Exemplo:

```js
throw new AppError("Tarefa nao encontrada", 404);
```

Fluxo do erro:

```text
Controller detecta problema
   |
   v
throw new AppError(...)
   |
   v
catch(error)
   |
   v
next(error)
   |
   v
error.middleware.js
   |
   v
Resposta JSON padronizada
```

Formato da resposta:

```json
{
  "error": "Tarefa nao encontrada"
}
```

---

## 15. Exemplos de uso

### Iniciar projeto

```bash
npm install
npm start
```

Servidor esperado:

```text
http://localhost:3000
```

### Listar tarefas

```bash
curl http://localhost:3000/tasks
```

Resposta:

```json
[
  {
    "id": 1,
    "title": "Estudar Express"
  }
]
```

### Buscar tarefa por ID

```bash
curl http://localhost:3000/tasks/1
```

Resposta:

```json
{
  "id": 1,
  "title": "Estudar Express"
}
```

### Criar tarefa

```bash
curl -X POST http://localhost:3000/tasks ^
  -H "Authorization: Bearer anytoken" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Nova tarefa\"}"
```

Resposta:

```json
{
  "id": 2,
  "title": "Nova tarefa"
}
```

### Atualizar tarefa

```bash
curl -X PUT http://localhost:3000/tasks/2 ^
  -H "Authorization: Bearer anytoken" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Tarefa atualizada\"}"
```

Resposta:

```json
{
  "id": 2,
  "title": "Tarefa atualizada"
}
```

### Excluir tarefa

```bash
curl -X DELETE http://localhost:3000/tasks/2 ^
  -H "Authorization: Bearer anytoken"
```

Resposta esperada:

```http
204 No Content
```

---

## 16. Codigos HTTP

| Codigo | Nome | Quando aparece |
|---:|---|---|
| 200 | OK | Listagem, busca e atualizacao com sucesso |
| 201 | Created | Criacao de tarefa |
| 204 | No Content | Exclusao com sucesso |
| 400 | Bad Request | ID invalido ou body invalido |
| 401 | Unauthorized | Token ausente ou formato incorreto |
| 404 | Not Found | Tarefa ou rota nao encontrada |
| 500 | Internal Server Error | Erro inesperado no servidor |

---

## 17. Pontos de atencao

### 1. Caracteres quebrados

Algumas mensagens do codigo aparecem com codificacao quebrada, por exemplo:

```text
ID invÃ¡lido
```

Isso indica problema de codificacao do arquivo. O ideal e salvar todos os arquivos em UTF-8.

### 2. Autenticacao ainda e simulada

O middleware de autenticacao apenas verifica o formato:

```http
Authorization: Bearer token
```

Ele nao valida se o token e verdadeiro.

### 3. SQLite e bom para estudo

SQLite e excelente para aprendizado, prototipos e aplicacoes pequenas.

Para sistemas maiores, pode ser necessario usar:

- PostgreSQL.
- MySQL.
- SQL Server.
- MongoDB, se o modelo for NoSQL.

### 4. Nao existem testes automatizados

O script de teste atual ainda e:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

Isso significa que nao ha uma suite de testes configurada.

### 5. Nome do controller

O arquivo `TaskControll.js` poderia ser renomeado para `TaskController.js` para seguir convencao mais comum.

---

## 18. Melhorias futuras

Sugestoes para evoluir o projeto:

- Corrigir codificacao dos arquivos para UTF-8.
- Criar arquivo `.env.example`.
- Implementar autenticacao real com JWT.
- Adicionar testes automatizados.
- Criar documentacao Swagger/OpenAPI.
- Adicionar campo `completed` na tabela `tasks`.
- Adicionar campos `createdAt` e `updatedAt`.
- Criar paginacao em `GET /tasks`.
- Criar filtros de busca por titulo.
- Separar schemas de criacao e atualizacao.
- Padronizar logs com `pino` ou `winston`.
- Renomear `TaskControll.js` para `TaskController.js`.

---

## 19. Resumo academico

Este projeto demonstra uma estrutura profissional de API em camadas.

Mapa mental:

```text
server.js
  inicia tudo

app.js
  configura Express

routes
  definem URLs e metodos HTTP

middlewares
  interceptam, validam, autenticam e tratam erros

controllers
  recebem requisicoes e devolvem respostas

services
  concentram regras de negocio

repositories
  acessam o banco de dados

database
  guarda conexao, migracao e arquivo SQLite
```

Tabela final de responsabilidades:

| Parte | Responsabilidade |
|---|---|
| `server.js` | Inicializa migracao e servidor |
| `app.js` | Configura Express, middlewares e rotas |
| `routes` | Define endpoints da API |
| `middlewares` | Controla autenticacao, validacao, logs e erros |
| `controllers` | Controla entrada e saida HTTP |
| `services` | Organiza regras de negocio |
| `repositories` | Executa SQL e acessa dados |
| `database` | Mantem conexao e estrutura do banco |
| `schemas` | Valida dados de entrada |
| `utils` | Guarda classes e funcoes reutilizaveis |

Conclusao:

Esta API e um bom exemplo de como organizar um projeto Back-end em camadas. Mesmo sendo pequena, ela ja apresenta conceitos importantes usados em projetos reais: modularizacao, persistencia SQL, validacao, middlewares, tratamento centralizado de erros e separacao de responsabilidades.

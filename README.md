# Claro Tasks

Aplicativo mobile para organizar times e tarefas. O repositório reúne o app React Native e a API NestJS em um único monorepo.

## 1. Decisões arquiteturais

- **MySQL:** O banco relacional garante integridade dos dados e consistência nos relacionamentos:
  - Chaves estrangeiras impedem associações com tarefas ou times inexistentes.
  - Uma chave composta impede duplicar uma associação entre tarefa e time.
  - Índices ajudam a acelerar consultas por tarefa, time ou associação.
  - Transações mantêm consistentes as alterações de uma tarefa e de seus times.
- **API NestJS:** A arquitetura em camadas usa módulos, controllers, services e repositories para separar HTTP, regras de negócio e persistência. As respostas de sucesso seguem `{ data, meta? }`; erros seguem `{ error: { code, message, details? } }`.
- **App React Native:** O frontend usa TypeScript, React Navigation e NativeWind. React Hook Form e Zod validam os formulários. React Query gerencia o estado remoto, as atualizações otimistas e a paginação incremental. Como o estado compartilhado do app é principalmente dado remoto, React Query atende essa necessidade sem exigir outro gerenciador global, como Redux ou Zustand.

## 2. Modelo de dados

- **Team:** nome, cor hexadecimal, descrição e datas de criação/atualização.
- **Task:** título, descrição, status (`PENDING`, `IN_PROGRESS` ou `COMPLETED`), prazo opcional e datas de criação/atualização.
- **TaskTeam:** tabela de associação que permite que uma tarefa pertença a zero, um ou vários times. A remoção de um time ou tarefa também remove suas associações.

O schema e as migrations estão em `api/prisma/`. Os dados iniciais estão em `api/fixtures/seed-data.json` e incluem três times e dez tarefas.

## 3. Como executar

### Pré-requisitos

- Node.js 20 ou superior e npm.
- Docker com Docker Compose v2.1.1 ou superior para o MySQL (`docker compose up --wait`).
- Para Android: Android Studio, SDK e um emulador ou dispositivo.
- Para iOS: macOS, Xcode e CocoaPods.

### Banco e API

Na primeira execução, crie `api/.env` a partir de `api/.env.example` e configure os valores para o seu ambiente local. Os valores do arquivo de exemplo são apenas para desenvolvimento; não os reutilize em produção:

```bash
cp api/.env.example api/.env
cd api
npm install
npm run db:generate
docker compose up -d --wait
npm run db:deploy
npm run db:seed
npm run start:dev
```

A opção `--wait` aguarda o healthcheck do MySQL antes de executar as migrations. A API ficará disponível em `http://localhost:3333/api`; mantenha esse terminal aberto. O seed recria os dados de avaliação, portanto deve ser usado somente em uma base local descartável.

### App mobile

Crie `app/.env` a partir de `app/.env.example` e configure `API_URL` para o ambiente em que o app será executado. Para o emulador Android, use `http://10.0.2.2:3333/api`; para o simulador iOS, `http://localhost:3333/api`. Em um aparelho físico, use o endereço IP da máquina na rede local. Execute os comandos a seguir a partir da raiz do repositório:

```bash
cd app
npm install
cp .env.example .env
```

No iOS, instale os pods:

```bash
cd app/ios
pod install
cd ..
```

Inicie o Metro em um terminal e mantenha-o aberto:

```bash
cd app
npm start
```

Em outro terminal, também a partir da raiz do repositório, inicie o app na plataforma desejada:

```bash
cd app
npm run android
# ou
npm run ios
```

Os projetos nativos estão em `app/android/` e `app/ios/`. Após alterar `app/.env`, reinicie o Metro para aplicar a nova configuração.

## 4. Exemplos de requisições

Listar tarefas pendentes de um time, buscando as mais recentes primeiro:

```bash
curl 'http://localhost:3333/api/tasks?teamId=ID_DO_TIME&status=PENDING&limit=10&offset=0&sort=createdAt:desc'
```

Buscar times por nome:

```bash
curl 'http://localhost:3333/api/teams?search=Mobile&limit=10&offset=0'
```

Criar um time:

```bash
curl -X POST 'http://localhost:3333/api/teams' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Squad Mobile","colorHex":"#00B37E","description":"Time do aplicativo"}'
```

Criar uma tarefa associada a mais de um time

```bash
curl -X POST 'http://localhost:3333/api/tasks' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Revisar cadastro","description":"Validar o fluxo mobile","status":"IN_PROGRESS","teamIds":["ID_DO_TIME_1","ID_DO_TIME_2"]}'
```

Atualizar um time:

```bash
curl -X PUT 'http://localhost:3333/api/teams/ID_DO_TIME' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Squad Mobile atualizado","colorHex":"#112233"}'
```

Atualizar o status de uma tarefa:

```bash
curl -X PATCH 'http://localhost:3333/api/tasks/ID_DA_TAREFA/status' \
  -H 'Content-Type: application/json' \
  -d '{"status":"COMPLETED"}'
```

Remover um time ou uma tarefa:

```bash
curl -X DELETE 'http://localhost:3333/api/teams/ID_DO_TIME'
curl -X DELETE 'http://localhost:3333/api/tasks/ID_DA_TAREFA'
```

Rotas da API:

- Times: `GET /api/teams`, `POST /api/teams`, `GET /api/teams/:id`, `PUT /api/teams/:id` e `DELETE /api/teams/:id`.
- Tarefas: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` e `PATCH /api/tasks/:id/status`.

As listagens aceitam `limit` e `offset`; times também aceitam `search`, enquanto tarefas aceitam `teamId`, `status`, `search` e `sort` (`createdAt`, `title`, `dueDate` ou `status`, seguido de `:asc` ou `:desc`). As respostas de listagem incluem metadados de paginação. O app carrega páginas adicionais conforme o usuário rola a lista. Os exemplos podem ser usados com cURL, Postman ou Insomnia.

## 5. O que evoluiria em produção

- **Cache:** Adicionar cache compartilhado para leituras de alto volume e definir invalidação por domínio. Redis poderia ser usado principalmente nas listagens de tarefas e times para reduzir a latência.
- **Logs e observabilidade:** Centralizar logs estruturados, métricas e rastreamento distribuído, removendo dados sensíveis.
- **Escalabilidade:** Executar a API atrás de um load balancer, orquestrar os contêineres com Kubernetes (por exemplo, EKS) e usar filas, como RabbitMQ ou Kafka, para tarefas assíncronas.
- **Segurança:** Implementar autenticação e autorização, restringir CORS por ambiente, adicionar rate limiting e auditoria.
- **Entrega:** Criar uma esteira de CI/CD e manter ambientes separados para desenvolvimento, homologação e produção.

## Testes

```bash
npm --prefix api test
npm --prefix api run test:e2e
npm --prefix api run build
npm --prefix app test -- --runInBand
cd app && npx tsc --noEmit
```

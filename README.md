# Claro Tasks

Aplicativo mobile para organizar times e tarefas. O repositório reúne o app React Native e a API NestJS em um único monorepo.

## 1. Decisões arquiteturais

- **MySQL:** O banco relacional garante integridade dos dados e consistência nos relacionamentos entre tabelas:

* Chaves estrangeiras: impedem associações com tarefas ou times inexistentes.
* Chave composta: impede cadastrar duas vezes a mesma associação.
* Joins: permitem consultar tarefas e seus times em uma operação SQL.
* Transações: permitem criar uma tarefa e suas associações de maneira atômica.
* Índices: ajudam a acelerar consultas por tarefa, time ou associação.

- **API NestJS:** Arquitetura em Camadas com módulos, controllers, services e repositories separam HTTP, regras de negócio e persistência. As respostas de sucesso seguem `{ data, meta? }`; erros seguem `{ error: { code, message, details? } }`.
- **App React Native:** o frontend usa TypeScript, React Navigation e NativeWind. React Hook Form e Zod validam os formulários. React Query gerencia o estado remoto, atualizações otimistas de tarefas e times e paginação incremental das listagens, a escolha dessa tecnologia _nesse cenário e requisitos do Teste_, torna desnecessário o uso de um gerenciador de estado global como Redux ou Zustand, pois ele já atende as necessidades.

## 2. Modelo de dados

- **Team:** nome, cor hexadecimal, descrição e datas de criação/atualização.
- **Task:** título, descrição, status (`PENDING`, `IN_PROGRESS` ou `COMPLETED`), prazo opcional e datas de criação/atualização.
- **TaskTeam:** tabela de associação que permite que uma tarefa pertença a zero, um ou vários times. A remoção de um time ou tarefa também remove suas associações.

O schema e as migrations estão em `api/prisma/`. Os dados iniciais estão em `api/fixtures/seed-data.json` e incluem três times e dez tarefas.

## 3. Como executar

### Pré-requisitos

- Node.js 20 ou superior e npm.
- Docker com Docker Compose para o MySQL.
- Para Android: Android Studio, SDK e um emulador ou dispositivo.
- Para iOS: macOS, Xcode e CocoaPods.

### Banco e API

Na primeira execução, crie `api/.env` a partir de `api/.env.example` e ajuste as credenciais se necessário:

```bash
cp api/.env.example api/.env
cd api
npm install
npm run db:generate
docker compose up -d
npm run db:deploy
npm run db:seed
npm run start:dev
```

A API ficará disponível em `http://localhost:3333/api`. O comando de seed recria os dados de avaliação, portanto deve ser usado em uma base local descartável.

### App mobile

Crie `app/.env` a partir de `app/.env.example` e configure `API_URL` para o ambiente em que o app será executado. Para o emulador Android, use `http://10.0.2.2:3333/api`; para o simulador iOS, `http://localhost:3333/api`. Em um aparelho físico, use o endereço IP da máquina na rede local.

```bash
cd app
npm install
```

Para iOS, instale os pods antes de compilar:

```bash
cd app/ios
pod install
cd ..
```

Em outro terminal, inicie a plataforma:

```bash
cd app
npm run android
# ou
npm run ios
```

E por fim inicie o Metro

```bash
npm start
```

Os projetos nativos estão em `app/android/` e `app/ios/`. Após alterar `.env`, reinicie o Metro para aplicar a nova configuração.

## 4. Exemplos de requisições

Listar tarefas pendentes de um time, buscando as mais recentes primeiro:

```bash
curl 'http://localhost:3333/api/tasks?teamId=ID_DO_TIME&status=PENDING&limit=10&offset=0&sort=createdAt:desc'
```

Criar um time:

```bash
curl -X POST 'http://localhost:3333/api/teams' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Squad Mobile","colorHex":"#00B37E","description":"Time do aplicativo"}'
```

Criar uma tarefa associada a mais de um time:

```bash
curl -X POST 'http://localhost:3333/api/tasks' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Revisar cadastro","description":"Validar o fluxo mobile","status":"IN_PROGRESS","teamIds":["ID_DO_TIME_1","ID_DO_TIME_2"]}'
```

As listagens aceitam `limit` e `offset`; a de times aceita `search` e a de tarefas aceita `teamId`, `status`, `search` e `sort` (`createdAt`, `title`, `dueDate` ou `status`, seguido de `:asc` ou `:desc`). O app solicita páginas adicionais conforme o usuário rola a lista. Esses exemplos também podem ser importados em Postman ou Insomnia.

## 5. O que evoluiria em produção

- **Cache:** Adicionar cache compartilhado para leituras de alto volume e definir invalidação por domínio, colocaria Redis principalmente nas listagens das tarefas e times para garantir maior velocidade e desempenho nas consultas.
- **Logs e observabilidade:** Centralizar logs estruturados, métricas e rastreamento distribuído, removendo dados sensíveis.
- **Escalabilidade:** Executar API atrás de um Load Balancer, Gerenciar os Containers Docker com Kubernetes e/ou EKS e usar filas para tarefas assíncronas com RabbitMQ/Kafka.
- **Segurança:** Criação de conta/acesso com autenticação e autorização com JWT + Keycloak, validação de CORS por ambiente, rate limiting e auditoria.
- **Entrega:** Criar a esteira de CI/CD; usar ambientes separados para desenvolvimento, homologação e produção.

## Testes

```bash
npm --prefix api test
npm --prefix api run test:e2e
npm --prefix api run build
npm --prefix app test -- --runInBand
cd app && npx tsc --noEmit
```

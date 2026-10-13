import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TeamsController } from '../src/teams/teams.controller';
import { TeamsService } from '../src/teams/teams.service';
import { TeamsRepository } from '../src/teams/teams.repository';
import { TasksController } from '../src/tasks/tasks.controller';
import { TasksService } from '../src/tasks/tasks.service';
import { TasksRepository } from '../src/tasks/tasks.repository';
import { CreateTeamDto } from '../src/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../src/teams/dto/update-team.dto';
import { QueryTeamDto } from '../src/teams/dto/query-team.dto';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto';
import { QueryTaskDto } from '../src/tasks/dto/query-task.dto';
import { UpdateTaskStatusDto } from '../src/tasks/dto/update-task-status.dto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

Reflect.defineMetadata('design:paramtypes', [TeamsService], TeamsController);
Reflect.defineMetadata('design:paramtypes', [TasksService], TasksController);
Reflect.defineMetadata('design:paramtypes', [TeamsRepository], TeamsService);
Reflect.defineMetadata('design:paramtypes', [TasksRepository], TasksService);
Reflect.defineMetadata('design:paramtypes', [PrismaService], TeamsRepository);
Reflect.defineMetadata('design:paramtypes', [PrismaService], TasksRepository);
Reflect.defineMetadata('design:paramtypes', [QueryTeamDto], TeamsController.prototype, 'findAll');
Reflect.defineMetadata('design:paramtypes', [CreateTeamDto], TeamsController.prototype, 'create');
Reflect.defineMetadata('design:paramtypes', [String], TeamsController.prototype, 'findOne');
Reflect.defineMetadata('design:paramtypes', [String, UpdateTeamDto], TeamsController.prototype, 'update');
Reflect.defineMetadata('design:paramtypes', [String], TeamsController.prototype, 'remove');
Reflect.defineMetadata('design:paramtypes', [QueryTaskDto], TasksController.prototype, 'findAll');
Reflect.defineMetadata('design:paramtypes', [CreateTaskDto], TasksController.prototype, 'create');
Reflect.defineMetadata('design:paramtypes', [String], TasksController.prototype, 'findOne');
Reflect.defineMetadata('design:paramtypes', [String, UpdateTaskDto], TasksController.prototype, 'update');
Reflect.defineMetadata('design:paramtypes', [String, UpdateTaskStatusDto], TasksController.prototype, 'updateStatus');
Reflect.defineMetadata('design:paramtypes', [String], TasksController.prototype, 'remove');

const teamFixture = {
  id: 'team-001',
  name: 'Claro Tech',
  colorHex: '#00B37E',
  description: 'Time de Teste',
  createdAt: new Date('2026-10-12T12:00:00.000Z'),
  updatedAt: new Date('2026-10-12T12:00:00.000Z'),
  tasks: [],
};
const taskFixture = {
  id: 'task-001',
  title: 'Tarefa Teste',
  description: 'Descrição da tarefa',
  status: 'PENDING',
  dueDate: null,
  createdAt: new Date('2026-10-12T12:00:00.000Z'),
  updatedAt: new Date('2026-10-12T12:00:00.000Z'),
  teams: [
    {
      team: { id: 'team-001', name: 'Claro Tech', colorHex: '#00B37E' },
    },
  ],
};

const mockPrismaService = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  team: {
    findMany: vi.fn().mockResolvedValue([teamFixture]),
    count: vi.fn().mockResolvedValue(1),
    findUnique: vi.fn().mockResolvedValue(teamFixture),
    create: vi.fn().mockImplementation(({ data }) =>
      Promise.resolve({ id: 'team-new', ...data, createdAt: new Date(), updatedAt: new Date() }),
    ),
    update: vi.fn().mockImplementation(({ where, data }) =>
      Promise.resolve({ ...teamFixture, id: where.id, ...data }),
    ),
    delete: vi.fn().mockResolvedValue(teamFixture),
  },
  task: {
    findMany: vi.fn().mockResolvedValue([taskFixture]),
    count: vi.fn().mockResolvedValue(1),
    findUnique: vi.fn().mockResolvedValue(taskFixture),
    create: vi.fn().mockImplementation(({ data }) =>
      Promise.resolve({
        ...taskFixture,
        id: 'task-new',
        ...data,
        teams: [],
      }),
    ),
    delete: vi.fn().mockResolvedValue(taskFixture),
  },
  $transaction: vi.fn((callback: (transaction: unknown) => unknown) =>
    callback({
      taskTeam: { deleteMany: vi.fn(), createMany: vi.fn() },
      task: {
        update: vi.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ ...taskFixture, id: where.id, ...data, teams: [] }),
        ),
      },
    }),
  ),
};

describe('HTTP API integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('teams endpoints', () => {
    it('GET /api/teams returns an envelope, filters, pagination, and metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/teams?search=Squad&limit=2&offset=4')
        .expect(200);
      expect(response.body).toMatchObject({
        data: [{ id: 'team-001', name: 'Claro Tech' }],
        meta: { total: 1, limit: 2, offset: 4, hasMore: false },
      });
      expect(mockPrismaService.team.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'Squad' } },
          skip: 4,
          take: 2,
        }),
      );
    });

    it('validates query parameters and returns the standard error envelope', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/teams?limit=0')
        .expect(400);
      expect(response.body.error).toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.any(String),
        details: expect.any(Array),
      });
    });

    it('GET /api/teams/:id returns a team and reports missing ids', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/teams/team-001')
        .expect(200);
      expect(response.body.data).toMatchObject({ id: 'team-001', colorHex: '#00B37E' });
      mockPrismaService.team.findUnique.mockResolvedValueOnce(null);
      const missing = await request(app.getHttpServer())
        .get('/api/teams/missing')
        .expect(404);
      expect(missing.body.error).toMatchObject({
        code: 'NOT_FOUND',
        message: expect.any(String),
      });
    });

    it('POST /api/teams creates valid teams and rejects invalid payloads', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/teams')
        .send({ name: 'Nova Squad', colorHex: '#00B37E', description: 'Time novo' })
        .expect(201);
      expect(created.body.data).toMatchObject({ id: 'team-new', name: 'Nova Squad' });
      const invalid = await request(app.getHttpServer())
        .post('/api/teams')
        .send({ name: 'A', colorHex: 'sem-cor' })
        .expect(400);
      expect(invalid.body.error).toHaveProperty('details');
    });

    it('PUT /api/teams/:id updates and validates team fields', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/teams/team-001')
        .send({ name: 'Equipe atualizada', colorHex: '#112233' })
        .expect(200);
      expect(response.body.data).toMatchObject({
        id: 'team-001',
        name: 'Equipe atualizada',
        colorHex: '#112233',
      });
      const invalid = await request(app.getHttpServer())
        .put('/api/teams/team-001')
        .send({ colorHex: 'invalid' })
        .expect(400);
      expect(invalid.body.error.code).toBe('BAD_REQUEST');
    });

    it('DELETE /api/teams/:id returns the deleted value and handles missing ids', async () => {
      const removed = await request(app.getHttpServer())
        .delete('/api/teams/team-001')
        .expect(200);
      expect(removed.body.data).toMatchObject({ id: 'team-001' });
      mockPrismaService.team.findUnique.mockResolvedValueOnce(null);
      const missing = await request(app.getHttpServer())
        .delete('/api/teams/missing')
        .expect(404);
      expect(missing.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('tasks endpoints', () => {
    it('GET /api/tasks filters by team, status, and search and returns pagination metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?teamId=team-001&status=PENDING&search=Teste&sort=title:asc&limit=5&offset=2')
        .expect(200);
      expect(response.body).toMatchObject({
        data: [{ id: 'task-001', teams: [{ id: 'team-001' }] }],
        meta: { total: 1, limit: 5, offset: 2, hasMore: false },
      });
      expect(mockPrismaService.task.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: {
            teams: { some: { teamId: 'team-001' } },
            status: 'PENDING',
            OR: [
              { title: { contains: 'Teste' } },
              { description: { contains: 'Teste' } },
            ],
          },
          skip: 2,
          take: 5,
          orderBy: { title: 'asc' },
        }),
      );
    });

    it('GET /api/tasks rejects invalid query values', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?status=UNKNOWN')
        .expect(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(response.body.error.details).toEqual(expect.any(Array));
    });

    it('GET /api/tasks/:id returns a task with its teams and handles a missing id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks/task-001')
        .expect(200);
      expect(response.body.data).toMatchObject({
        id: 'task-001',
        description: 'Descrição da tarefa',
        teams: [{ id: 'team-001', name: 'Claro Tech' }],
      });
      mockPrismaService.task.findUnique.mockResolvedValueOnce(null);
      const missing = await request(app.getHttpServer())
        .get('/api/tasks/missing')
        .expect(404);
      expect(missing.body.error.code).toBe('NOT_FOUND');
    });

    it('POST /api/tasks creates a valid task and requires a non-empty description', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          title: 'Nova tarefa',
          description: 'Detalhes obrigatórios',
          teamIds: ['team-001'],
        })
        .expect(201);
      expect(created.body.data).toMatchObject({
        id: 'task-new',
        title: 'Nova tarefa',
        description: 'Detalhes obrigatórios',
      });
      const missing = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'Tarefa sem descrição' })
        .expect(400);
      expect(missing.body.error).toMatchObject({
        code: 'BAD_REQUEST',
        details: expect.any(Array),
      });
      const blank = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'Tarefa sem descrição', description: '   ' })
        .expect(400);
      expect(blank.body.error.code).toBe('BAD_REQUEST');
    });

    it('PUT /api/tasks/:id updates fields and requires a description', async () => {
      const updated = await request(app.getHttpServer())
        .put('/api/tasks/task-001')
        .send({
          title: 'Tarefa alterada',
          description: 'Nova descrição',
          status: 'COMPLETED',
          teamIds: [],
        })
        .expect(200);
      expect(updated.body.data).toMatchObject({
        id: 'task-001',
        title: 'Tarefa alterada',
        description: 'Nova descrição',
      });
      const invalid = await request(app.getHttpServer())
        .put('/api/tasks/task-001')
        .send({ title: 'Sem descrição' })
        .expect(400);
      expect(invalid.body.error.code).toBe('BAD_REQUEST');
    });

    it('PATCH /api/tasks/:id/status validates and updates task status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/tasks/task-001/status')
        .send({ status: 'COMPLETED' })
        .expect(200);
      expect(response.body.data).toMatchObject({ id: 'task-001', status: 'COMPLETED' });
      const invalid = await request(app.getHttpServer())
        .patch('/api/tasks/task-001/status')
        .send({ status: 'UNKNOWN' })
        .expect(400);
      expect(invalid.body.error.code).toBe('BAD_REQUEST');
    });

    it('DELETE /api/tasks/:id returns the deleted value and handles missing ids', async () => {
      const removed = await request(app.getHttpServer())
        .delete('/api/tasks/task-001')
        .expect(200);
      expect(removed.body.data).toMatchObject({ id: 'task-001' });
      mockPrismaService.task.findUnique.mockResolvedValueOnce(null);
      const missing = await request(app.getHttpServer())
        .delete('/api/tasks/missing')
        .expect(404);
      expect(missing.body.error.code).toBe('NOT_FOUND');
    });
  });

  it('returns a consistent 500 error envelope when persistence fails', async () => {
    mockPrismaService.team.findMany.mockRejectedValueOnce(new Error('database unavailable'));
    const response = await request(app.getHttpServer())
      .get('/api/teams')
      .expect(500);
    expect(response.body.error).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'database unavailable',
    });
  });
});

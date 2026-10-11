import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('API Integration Tests (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    team: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'team-001',
          name: 'Claro Tech',
          colorHex: '#00B37E',
          description: 'Time de Teste',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      count: vi.fn().mockResolvedValue(1),
      findUnique: vi.fn().mockResolvedValue({
        id: 'team-001',
        name: 'Claro Tech',
        colorHex: '#00B37E',
        description: 'Time de Teste',
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'team-new',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
      delete: vi.fn().mockResolvedValue({ id: 'team-001' }),
    },
    task: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'task-001',
          title: 'Tarefa Teste',
          description: 'Desc',
          status: 'PENDING',
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          teams: [
            {
              team: {
                id: 'team-001',
                name: 'Claro Tech',
                colorHex: '#00B37E',
              },
            },
          ],
        },
      ]),
      count: vi.fn().mockResolvedValue(1),
      findUnique: vi.fn().mockResolvedValue({
        id: 'task-001',
        title: 'Tarefa Teste',
        description: 'Desc',
        status: 'PENDING',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        teams: [],
      }),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'task-new',
          title: data.title,
          description: data.description,
          status: data.status || 'PENDING',
          dueDate: data.dueDate,
          createdAt: new Date(),
          updatedAt: new Date(),
          teams: [],
        }),
      ),
      delete: vi.fn().mockResolvedValue({ id: 'task-001' }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/teams', () => {
    it('should return 200 with standard response envelope { data, meta }', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/teams')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.total).toBe(1);
    });
  });

  describe('POST /api/teams', () => {
    it('should create team when valid payload provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/teams')
        .send({
          name: 'Nova Squad Claro',
          colorHex: '#00B37E',
          description: 'Descrição squad',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Nova Squad Claro');
    });

    it('should return 400 error envelope when validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/teams')
        .send({
          name: 'A', // invalid: min 2
          colorHex: 'not-a-color', // invalid hex
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(response.body.error).toHaveProperty('details');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks with team relationships and pagination meta', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?limit=10&offset=0')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.meta).toHaveProperty('total', 1);
      expect(response.body.data[0]).toHaveProperty('teams');
    });
  });
});


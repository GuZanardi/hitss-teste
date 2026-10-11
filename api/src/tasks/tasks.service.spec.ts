import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TasksService', () => {
  let service: TasksService;
  let repository: any;

  const mockTaskWithTeams = {
    id: 'task-1',
    title: 'Desenvolver Teste Hitss',
    description: 'Criar app e API',
    status: TaskStatus.PENDING,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    teams: [
      {
        team: {
          id: 'team-1',
          name: 'Claro Tech',
          colorHex: '#00B37E',
        },
      },
    ],
  };

  beforeEach(async () => {
    const mockRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(TasksRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create task and format associated teams', async () => {
      repository.create.mockResolvedValue(mockTaskWithTeams);

      const result = await service.create({
        title: 'Desenvolver Teste Hitss',
        description: 'Criar app e API',
        teamIds: ['team-1'],
      });

      expect(repository.create).toHaveBeenCalled();
      expect(result.teams).toEqual([
        { id: 'team-1', name: 'Claro Tech', colorHex: '#00B37E' },
      ]);
    });
  });

  describe('findAll', () => {
    it('should filter by teamId when provided', async () => {
      repository.findAll.mockResolvedValue([[mockTaskWithTeams], 1]);

      const result = await service.findAll({ teamId: 'team-1' });

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teams: { some: { teamId: 'team-1' } },
          }),
        }),
      );
      expect(result.data.length).toBe(1);
    });

    it('should filter by status when provided', async () => {
      repository.findAll.mockResolvedValue([[mockTaskWithTeams], 1]);

      await service.findAll({ status: TaskStatus.PENDING });

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TaskStatus.PENDING,
          }),
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      repository.findById.mockResolvedValue(mockTaskWithTeams);
      repository.update.mockResolvedValue({
        ...mockTaskWithTeams,
        status: TaskStatus.COMPLETED,
      });

      const result = await service.updateStatus('task-1', {
        status: TaskStatus.COMPLETED,
      });

      expect(result.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if task does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-task')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

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
    const mockRepo = Object.create(TasksRepository.prototype) as TasksRepository;
    vi.spyOn(mockRepo, 'create').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'findAll').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'findById').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'update').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'delete').mockImplementation(vi.fn());

    repository = mockRepo;
    service = new TasksService(mockRepo);
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

    it('creates a task without teams or an optional due date', async () => {
      repository.create.mockResolvedValue({ ...mockTaskWithTeams, teams: [] });
      await service.create({ title: 'Tarefa simples', description: 'Detalhes' });
      expect(repository.create).toHaveBeenCalledWith({
        title: 'Tarefa simples',
        description: 'Detalhes',
        status: undefined,
        dueDate: null,
        teamIds: [],
      });
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

    it('applies trimmed search, sorting, and requested pagination', async () => {
      repository.findAll.mockResolvedValue([[mockTaskWithTeams], 3]);
      const result = await service.findAll({
        search: '  Hitss  ',
        sort: 'title:asc',
        limit: 1,
        offset: 1,
      });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'Hitss' } },
              { description: { contains: 'Hitss' } },
            ],
          },
          skip: 1,
          take: 1,
          orderBy: { title: 'asc' },
        }),
      );
      expect(result.meta).toEqual({ total: 3, limit: 1, offset: 1, hasMore: true });
    });

    it('uses defaults for unsupported sort options and returns empty pages', async () => {
      repository.findAll.mockResolvedValue([[], 0]);
      const result = await service.findAll({ sort: 'invalid:asc' });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, orderBy: { createdAt: 'desc' } }),
      );
      expect(result.data).toEqual([]);
      expect(result.meta.hasMore).toBe(false);
    });

    it('propagates repository errors', async () => {
      repository.findAll.mockRejectedValue(new Error('database unavailable'));
      await expect(service.findAll({})).rejects.toThrow('database unavailable');
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

  describe('update and remove', () => {
    it('updates all editable task fields and formats teams', async () => {
      repository.findById.mockResolvedValue(mockTaskWithTeams);
      repository.update.mockResolvedValue({
        ...mockTaskWithTeams,
        title: 'Atualizada',
        status: TaskStatus.COMPLETED,
      });
      const result = await service.update('task-1', {
        title: 'Atualizada',
        description: 'Descrição atualizada',
        status: TaskStatus.COMPLETED,
        dueDate: '2026-10-13T00:00:00.000Z',
        teamIds: ['team-1'],
      });
      expect(repository.update).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          title: 'Atualizada',
          description: 'Descrição atualizada',
          status: TaskStatus.COMPLETED,
          teamIds: ['team-1'],
          dueDate: new Date('2026-10-13T00:00:00.000Z'),
        }),
      );
      expect(result.title).toBe('Atualizada');
    });

    it('does not update or delete a task that does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        service.update('missing', {
          title: 'Missing',
          description: 'Descrição obrigatória',
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('deletes an existing task and propagates repository errors', async () => {
      repository.findById.mockResolvedValue(mockTaskWithTeams);
      repository.delete.mockResolvedValue(mockTaskWithTeams);
      await expect(service.remove('task-1')).resolves.toEqual(mockTaskWithTeams);
      repository.update.mockRejectedValue(new Error('write failed'));
      await expect(
        service.update('task-1', {
          title: 'Tarefa alterada',
          description: 'Descrição atualizada',
        }),
      ).rejects.toThrow('write failed');
    });
  });
});

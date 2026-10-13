import { TeamsService } from './teams.service';
import { TeamsRepository } from './teams.repository';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TeamsService', () => {
  let service: TeamsService;
  let repository: any;

  const mockTeam = {
    id: 'team-1',
    name: 'Claro Tech',
    colorHex: '#00B37E',
    description: 'Time de engenharia',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = Object.create(TeamsRepository.prototype) as TeamsRepository;
    vi.spyOn(mockRepo, 'create').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'findAll').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'findById').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'update').mockImplementation(vi.fn());
    vi.spyOn(mockRepo, 'delete').mockImplementation(vi.fn());

    repository = mockRepo;
    service = new TeamsService(mockRepo);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new team', async () => {
      repository.create.mockResolvedValue(mockTeam);

      const result = await service.create({
        name: 'Claro Tech',
        colorHex: '#00B37E',
        description: 'Time de engenharia',
      });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Claro Tech',
        colorHex: '#00B37E',
        description: 'Time de engenharia',
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of teams with metadata', async () => {
      repository.findAll.mockResolvedValue([[mockTeam], 1]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual({
        data: [mockTeam],
        meta: {
          total: 1,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      });
    });

    it('should filter teams by search term when provided', async () => {
      repository.findAll.mockResolvedValue([[mockTeam], 1]);

      await service.findAll({ search: 'Tech' });

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'Tech' } },
        }),
      );
    });

    it('trims the search term and applies pagination metadata', async () => {
      repository.findAll.mockResolvedValue([[mockTeam], 4]);
      const result = await service.findAll({
        search: '  Claro ',
        limit: 2,
        offset: 2,
      });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'Claro' } },
          skip: 2,
          take: 2,
        }),
      );
      expect(result.meta).toEqual({ total: 4, limit: 2, offset: 2, hasMore: true });
    });

    it('returns an empty page and propagates repository errors', async () => {
      repository.findAll.mockResolvedValue([[], 0]);
      expect((await service.findAll({})).meta.hasMore).toBe(false);
      repository.findAll.mockRejectedValue(new Error('database unavailable'));
      await expect(service.findAll({})).rejects.toThrow('database unavailable');
    });
  });

  describe('findOne', () => {
    it('should return team when found', async () => {
      repository.findById.mockResolvedValue(mockTeam);

      const result = await service.findOne('team-1');
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException when team does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove team when found', async () => {
      repository.findById.mockResolvedValue(mockTeam);
      repository.delete.mockResolvedValue(mockTeam);

      const result = await service.remove('team-1');
      expect(result).toEqual(mockTeam);
    });

    it('updates an existing team and rejects update or delete for missing teams', async () => {
      repository.findById.mockResolvedValue(mockTeam);
      repository.update.mockResolvedValue({ ...mockTeam, name: 'Novo nome' });
      await expect(
        service.update('team-1', { name: 'Novo nome' }),
      ).resolves.toMatchObject({ name: 'Novo nome' });
      repository.findById.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });

    it('propagates repository write failures', async () => {
      repository.findById.mockResolvedValue(mockTeam);
      repository.delete.mockRejectedValue(new Error('delete failed'));
      await expect(service.remove('team-1')).rejects.toThrow('delete failed');
    });
  });
});

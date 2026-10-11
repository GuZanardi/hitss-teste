import { Test, TestingModule } from '@nestjs/testing';
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
    const mockRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: TeamsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    repository = module.get(TeamsRepository);
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
  });
});

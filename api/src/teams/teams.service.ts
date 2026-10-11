import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamsRepository } from './teams.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private readonly teamsRepository: TeamsRepository) {}

  async create(createTeamDto: CreateTeamDto) {
    return this.teamsRepository.create({
      name: createTeamDto.name,
      colorHex: createTeamDto.colorHex,
      description: createTeamDto.description,
    });
  }

  async findAll(query: QueryTeamDto) {
    const limit = query.limit ? Number(query.limit) : 10;
    const offset = query.offset ? Number(query.offset) : 0;

    const where: Prisma.TeamWhereInput = {};
    if (query.search && query.search.trim().length > 0) {
      where.name = {
        contains: query.search.trim(),
      };
    }

    const [items, total] = await this.teamsRepository.findAll({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: items,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    };
  }

  async findOne(id: string) {
    const team = await this.teamsRepository.findById(id);
    if (!team) {
      throw new NotFoundException(`Time com ID "${id}" não encontrado.`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    await this.findOne(id); // Garante existência
    return this.teamsRepository.update(id, updateTeamDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Garante existência
    return this.teamsRepository.delete(id);
  }
}


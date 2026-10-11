import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Team, Prisma } from '@prisma/client';

@Injectable()
export class TeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TeamCreateInput): Promise<Team> {
    return this.prisma.team.create({ data });
  }

  async findAll(params: {
    where?: Prisma.TeamWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.TeamOrderByWithRelationInput;
  }): Promise<[Team[], number]> {
    const { where, skip, take, orderBy } = params;
    const [items, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      this.prisma.team.count({ where }),
    ]);
    return [items, total];
  }

  async findById(id: string): Promise<Team | null> {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            task: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    return this.prisma.team.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Team> {
    return this.prisma.team.delete({
      where: { id },
    });
  }
}


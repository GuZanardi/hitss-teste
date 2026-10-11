import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, Prisma, TaskStatus } from '@prisma/client';

export type TaskWithTeams = Task & {
  teams: {
    team: {
      id: string;
      name: string;
      colorHex: string;
    };
  }[];
};

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: Date | null;
    teamIds?: string[];
  }): Promise<TaskWithTeams> {
    const { title, description, status, dueDate, teamIds = [] } = data;

    return this.prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.PENDING,
        dueDate,
        teams: {
          create: teamIds.map((tId) => ({
            team: {
              connect: { id: tId },
            },
          })),
        },
      },
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                colorHex: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(params: {
    where?: Prisma.TaskWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<[TaskWithTeams[], number]> {
    const { where, skip, take, orderBy } = params;

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          teams: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  colorHex: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return [items, total];
  }

  async findById(id: string): Promise<TaskWithTeams | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                colorHex: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      dueDate?: Date | null;
      teamIds?: string[];
    },
  ): Promise<TaskWithTeams> {
    const { title, description, status, dueDate, teamIds } = data;

    return this.prisma.$transaction(async (tx) => {
      if (teamIds !== undefined) {
        // Remove existing associations and recreate
        await tx.taskTeam.deleteMany({
          where: { taskId: id },
        });

        if (teamIds.length > 0) {
          await tx.taskTeam.createMany({
            data: teamIds.map((tId) => ({
              taskId: id,
              teamId: tId,
            })),
          });
        }
      }

      return tx.task.update({
        where: { id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(dueDate !== undefined ? { dueDate } : {}),
        },
        include: {
          teams: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  colorHex: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async delete(id: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}


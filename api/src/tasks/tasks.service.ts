import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository, TaskWithTeams } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  private formatTask(task: TaskWithTeams) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      teams: task.teams.map((t) => t.team),
    };
  }

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      teamIds: createTaskDto.teamIds || [],
    });

    return this.formatTask(task);
  }

  async findAll(query: QueryTaskDto) {
    const limit = query.limit ? Number(query.limit) : 10;
    const offset = query.offset ? Number(query.offset) : 0;

    const where: Prisma.TaskWhereInput = {};

    if (query.teamId && query.teamId.trim().length > 0) {
      where.teams = {
        some: {
          teamId: query.teamId.trim(),
        },
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
      ];
    }

    let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      const order = direction?.toLowerCase() === 'asc' ? 'asc' : 'desc';
      if (field === 'createdAt' || field === 'title' || field === 'dueDate' || field === 'status') {
        orderBy = { [field]: order };
      }
    }

    const [items, total] = await this.tasksRepository.findAll({
      where,
      skip: offset,
      take: limit,
      orderBy,
    });

    return {
      data: items.map((task) => this.formatTask(task)),
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    };
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Tarefa com ID "${id}" não encontrada.`);
    }
    return this.formatTask(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id); // Garante existência

    const task = await this.tasksRepository.update(id, {
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      status: updateTaskDto.status,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
      teamIds: updateTaskDto.teamIds,
    });

    return this.formatTask(task);
  }

  async updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto) {
    await this.findOne(id);

    const task = await this.tasksRepository.update(id, {
      status: updateStatusDto.status,
    });

    return this.formatTask(task);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tasksRepository.delete(id);
  }
}


import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskStatusDto {
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  @IsEnum(TaskStatus, {
    message: 'O status deve ser PENDING, IN_PROGRESS ou COMPLETED.',
  })
  status: TaskStatus;
}


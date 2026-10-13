import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString({ message: 'O título da tarefa deve ser um texto.' })
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  @MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
  title: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição da tarefa é obrigatória.' })
  @Matches(/\S/, { message: 'A descrição da tarefa é obrigatória.' })
  description: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'O status deve ser PENDING, IN_PROGRESS ou COMPLETED.',
  })
  status?: TaskStatus = TaskStatus.PENDING;

  @IsOptional()
  @IsDateString({}, { message: 'A data limite deve ser uma data válida em formato ISO.' })
  dueDate?: string;

  @IsOptional()
  @IsArray({ message: 'Os IDs dos times devem ser enviados em uma lista.' })
  @IsString({ each: true, message: 'Cada identificador de time deve ser uma string.' })
  teamIds?: string[] = [];
}

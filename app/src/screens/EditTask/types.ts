import * as z from 'zod';
import { TaskStatus, Team } from '../../types';

export const editTaskSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  teamIds: z.array(z.string()),
});

export type EditTaskFormData = z.infer<typeof editTaskSchema>;

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  teamIds: string[];
}

export interface EditTaskTeamsResponse {
  data: Team[];
}

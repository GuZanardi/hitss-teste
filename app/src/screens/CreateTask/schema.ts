import * as z from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
  description: z.string().trim().min(1, 'A descrição é obrigatória.'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  teamIds: z.array(z.string()),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

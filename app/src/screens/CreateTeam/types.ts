import * as z from 'zod';
import { Team } from '../../types';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'O nome do time deve ter no mínimo 2 caracteres.' }),
  colorHex: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
      message: 'Selecione uma cor hexadecimal válida.',
    }),
  description: z.string().optional(),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export interface CreateTeamPayload {
  name: string;
  colorHex: string;
  description?: string;
}

export interface CreateTeamResponse {
  data: Team;
}


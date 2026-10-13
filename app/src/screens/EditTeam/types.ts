import { createTeamSchema } from '../CreateTeam/types';
import { z } from 'zod';

export const editTeamSchema = createTeamSchema;
export type EditTeamFormData = z.infer<typeof editTeamSchema>;

import { createTeamSchema } from '../CreateTeam/schema';
import { z } from 'zod';

export const editTeamSchema = createTeamSchema;
export type EditTeamFormData = z.infer<typeof editTeamSchema>;

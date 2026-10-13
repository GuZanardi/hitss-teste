import { tasksService } from '../../services/tasks.service';
import { teamsService } from '../../services/teams.service';
import { CreateTaskPayload } from './types';

export const createTaskService = {
  getTeams: teamsService.getTeams,
  createTask: (payload: CreateTaskPayload) => tasksService.createTask(payload),
};

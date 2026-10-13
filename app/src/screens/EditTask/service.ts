import { tasksService } from '../../services/tasks.service';
import { teamsService } from '../../services/teams.service';
import { UpdateTaskPayload } from './types';

export const editTaskService = {
  getTask: tasksService.getTaskById,
  getTeams: teamsService.getTeams,
  updateTask: (id: string, payload: UpdateTaskPayload) =>
    tasksService.updateTask(id, payload),
  deleteTask: tasksService.deleteTask,
};

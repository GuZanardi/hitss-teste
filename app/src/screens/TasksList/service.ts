import { tasksService } from '../../services/tasks.service';
import { teamsService } from '../../services/teams.service';

export const tasksListService = {
  getTasks: tasksService.getTasks,
  getTeams: teamsService.getTeams,
};

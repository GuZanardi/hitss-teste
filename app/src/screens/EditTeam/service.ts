import { teamsService } from '../../services/teams.service';

export const editTeamService = {
  getTeam: teamsService.getTeamById,
  updateTeam: teamsService.updateTeam,
};

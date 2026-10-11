import { api } from '../../services/api';
import { TeamsListQueryParams, TeamsListResponse } from './types';

export const teamsListService = {
  async fetchTeams(params: TeamsListQueryParams): Promise<TeamsListResponse> {
    const response = await api.get<TeamsListResponse>('/teams', { params });
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
};


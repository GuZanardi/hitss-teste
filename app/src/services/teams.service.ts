import { api } from './api';
import type { ApiResponse, Team } from '../types';
import type {
  CreateTeamData,
  TeamsQueryParams,
  UpdateTeamData,
} from '../types/teams.types';

export const teamsService = {
  async getTeams(params?: TeamsQueryParams): Promise<ApiResponse<Team[]>> {
    const response = await api.get<ApiResponse<Team[]>>('/teams', { params });
    return response.data;
  },

  async getTeamById(id: string): Promise<ApiResponse<Team>> {
    const response = await api.get<ApiResponse<Team>>(`/teams/${id}`);
    return response.data;
  },

  async createTeam(data: CreateTeamData): Promise<ApiResponse<Team>> {
    const response = await api.post<ApiResponse<Team>>('/teams', data);
    return response.data;
  },

  async updateTeam(id: string, data: UpdateTeamData): Promise<ApiResponse<Team>> {
    const response = await api.put<ApiResponse<Team>>(`/teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
};

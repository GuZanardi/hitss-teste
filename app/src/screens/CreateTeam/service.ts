import { api } from '../../services/api';
import { CreateTeamPayload, CreateTeamResponse } from './types';

export const createTeamService = {
  async createTeam(payload: CreateTeamPayload): Promise<CreateTeamResponse> {
    const response = await api.post<CreateTeamResponse>('/teams', payload);
    return response.data;
  },
};


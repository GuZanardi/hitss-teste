import type { InfiniteData } from '@tanstack/react-query';
import type { ApiResponse, Team } from './index';

export interface TeamsQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTeamData {
  name: string;
  colorHex: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  colorHex?: string;
  description?: string;
}

export type TeamsPage = ApiResponse<Team[]>;
export type InfiniteTeamsData = InfiniteData<TeamsPage>;

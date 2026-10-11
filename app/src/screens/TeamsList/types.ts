import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Team, PaginationMeta } from '../../types';

export type TeamsListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TeamsList'
>;

export interface TeamsListQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TeamsListResponse {
  data: Team[];
  meta?: PaginationMeta;
}


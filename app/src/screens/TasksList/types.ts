import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import {
  RootStackParamList,
  Task,
  TaskStatus,
  PaginationMeta,
  Team,
} from '../../types';

export type TasksListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TasksList'
>;

export type TasksListRouteProp = RouteProp<RootStackParamList, 'TasksList'>;

export interface TasksListQueryParams {
  teamId?: string;
  status?: TaskStatus;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface TasksListResponse {
  data: Task[];
  meta?: PaginationMeta;
}

export interface TeamsFilterResponse {
  data: Team[];
}

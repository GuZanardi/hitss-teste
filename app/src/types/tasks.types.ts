import type { InfiniteData } from '@tanstack/react-query';
import type { ApiResponse, Task, TaskStatus } from './index';

export interface TasksQueryParams {
  teamId?: string;
  status?: TaskStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: TaskStatus;
  dueDate?: string;
  teamIds?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description: string;
  status?: TaskStatus;
  dueDate?: string;
  teamIds?: string[];
}

export interface UpdateTaskVariables {
  id: string;
  data: UpdateTaskData;
}

export type TasksPage = ApiResponse<Task[]>;
export type InfiniteTasksData = InfiniteData<TasksPage>;

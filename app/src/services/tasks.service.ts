import { api } from './api';
import type { ApiResponse, Task, TaskStatus } from '../types';
import type {
  CreateTaskData,
  TasksQueryParams,
  UpdateTaskData,
} from '../types/tasks.types';

export const tasksService = {
  async getTasks(params?: TasksQueryParams): Promise<ApiResponse<Task[]>> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks', { params });
    return response.data;
  },

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data;
  },

  async updateTask(
    id: string,
    data: UpdateTaskData,
  ): Promise<ApiResponse<Task>> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data;
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<ApiResponse<Task>> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};

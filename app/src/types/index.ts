export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Team {
  id: string;
  name: string;
  colorHex: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTeamInfo {
  id: string;
  name: string;
  colorHex: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  teams: TaskTeamInfo[];
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export type RootStackParamList = {
  TeamsList: undefined;
  CreateTeam: undefined;
  TasksList: { initialTeamId?: string; teamName?: string } | undefined;
  CreateTask: { preselectedTeamId?: string } | undefined;
  EditTask: { taskId: string };
};


import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { tasksService } from '../services/tasks.service';
import { Task, TaskStatus, ApiResponse } from '../types';

export const TASKS_QUERY_KEY = ['tasks'];

export function useTasks(params?: {
  teamId?: string;
  status?: TaskStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, params],
    queryFn: () => tasksService.getTasks(params),
    placeholderData: keepPreviousData,
  });
}

export function useTask(id?: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id!),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksService.updateTaskStatus(id, status),
    // Optimistic update na alteração de status
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ['task', id] });

      const previousTasksData = queryClient.getQueriesData<ApiResponse<Task[]>>({
        queryKey: TASKS_QUERY_KEY,
      });
      const previousSingleTask = queryClient.getQueryData<ApiResponse<Task>>(['task', id]);

      // Atualiza de forma otimista nas listagens
      queryClient.setQueriesData<ApiResponse<Task[]>>(
        { queryKey: TASKS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === id ? { ...task, status } : task,
            ),
          };
        },
      );

      // Atualiza no cache individual
      if (previousSingleTask) {
        queryClient.setQueryData<ApiResponse<Task>>(['task', id], {
          ...previousSingleTask,
          data: { ...previousSingleTask.data, status },
        });
      }

      return { previousTasksData, previousSingleTask };
    },
    onError: (_err, { id }, context) => {
      // Rollback
      if (context?.previousTasksData) {
        context.previousTasksData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSingleTask) {
        queryClient.setQueryData(['task', id], context.previousSingleTask);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        dueDate?: string;
        teamIds?: string[];
      };
    }) => tasksService.updateTask(id, data),
    // Optimistic update na edição quando o status é modificado
    onMutate: async ({ id, data }) => {
      if (!data.status) return null;

      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasksData = queryClient.getQueriesData<ApiResponse<Task[]>>({
        queryKey: TASKS_QUERY_KEY,
      });

      queryClient.setQueriesData<ApiResponse<Task[]>>(
        { queryKey: TASKS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === id ? { ...task, status: data.status! } : task,
            ),
          };
        },
      );

      return { previousTasksData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasksData) {
        context.previousTasksData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    // Optimistic update na exclusão de tarefas
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasksData = queryClient.getQueriesData<ApiResponse<Task[]>>({
        queryKey: TASKS_QUERY_KEY,
      });

      queryClient.setQueriesData<ApiResponse<Task[]>>(
        { queryKey: TASKS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((task) => task.id !== deletedId),
            meta: old.meta
              ? { ...old.meta, total: Math.max(0, old.meta.total - 1) }
              : undefined,
          };
        },
      );

      return { previousTasksData };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousTasksData) {
        context.previousTasksData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

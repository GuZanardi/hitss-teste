import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
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
  return useInfiniteQuery({
    queryKey: [...TASKS_QUERY_KEY, 'infinite', { ...params, offset: undefined }],
    initialPageParam: params?.offset ?? 0,
    queryFn: ({ pageParam }) =>
      tasksService.getTasks({ ...params, offset: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore
        ? lastPage.meta.offset + lastPage.meta.limit
        : undefined,
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

      const previousTasksData = queryClient.getQueriesData<
        InfiniteData<ApiResponse<Task[]>>
      >({
        queryKey: [...TASKS_QUERY_KEY, 'infinite'],
      });
      const previousSingleTask = queryClient.getQueryData<ApiResponse<Task>>([
        'task',
        id,
      ]);

      // Atualiza de forma otimista nas listagens
      queryClient.setQueriesData<InfiniteData<ApiResponse<Task[]>>>(
        { queryKey: [...TASKS_QUERY_KEY, 'infinite'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((task) =>
                task.id === id ? { ...task, status } : task,
              ),
            })),
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
        description: string;
        status?: TaskStatus;
        dueDate?: string;
        teamIds?: string[];
      };
    }) => tasksService.updateTask(id, data),
    // Optimistic update na edição quando o status é modificado
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasksData = queryClient.getQueriesData<
        InfiniteData<ApiResponse<Task[]>>
      >({
        queryKey: [...TASKS_QUERY_KEY, 'infinite'],
      });

      queryClient.setQueriesData<InfiniteData<ApiResponse<Task[]>>>(
        { queryKey: [...TASKS_QUERY_KEY, 'infinite'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((task) =>
                task.id === id ? { ...task, ...data } : task,
              ),
            })),
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
      const previousTasksData = queryClient.getQueriesData<
        InfiniteData<ApiResponse<Task[]>>
      >({
        queryKey: [...TASKS_QUERY_KEY, 'infinite'],
      });

      queryClient.setQueriesData<InfiniteData<ApiResponse<Task[]>>>(
        { queryKey: [...TASKS_QUERY_KEY, 'infinite'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((task) => task.id !== deletedId),
              meta: page.meta
                ? { ...page.meta, total: Math.max(0, page.meta.total - 1) }
                : undefined,
            })),
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

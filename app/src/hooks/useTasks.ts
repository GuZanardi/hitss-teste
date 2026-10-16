import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { tasksService } from '../services/tasks.service';
import type { TasksQueryParams } from '../types/tasks.types';
import type {
  InfiniteTasksData,
  UpdateTaskVariables,
} from '../types/tasks.types';
import type { ApiResponse, Task, TaskStatus, Team } from '../types';
import { TEAMS_QUERY_KEY } from './useTeams';

export const TASKS_QUERY_KEY = ['tasks'];
export const TASK_QUERY_KEY = ['task'];
export const TASKS_INFINITE_QUERY_KEY = [...TASKS_QUERY_KEY, 'infinite'];

export function useTasks(params?: TasksQueryParams) {
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
    queryKey: [...TASK_QUERY_KEY, id],
    queryFn: () => tasksService.getTaskById(id!),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY }),
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksService.updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      const taskQueryKey = [...TASK_QUERY_KEY, id];
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: taskQueryKey });

      const previousTasks = queryClient.getQueriesData<InfiniteTasksData>({
        queryKey: TASKS_INFINITE_QUERY_KEY,
      });
      const previousTask =
        queryClient.getQueryData<ApiResponse<Task>>(taskQueryKey);

      queryClient.setQueriesData<InfiniteTasksData>(
        { queryKey: TASKS_INFINITE_QUERY_KEY },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((task) =>
                    task.id === id ? { ...task, status } : task,
                  ),
                })),
              }
            : old,
      );

      if (previousTask) {
        queryClient.setQueryData<ApiResponse<Task>>(taskQueryKey, {
          ...previousTask,
          data: { ...previousTask.data, status },
        });
      }

      return { previousTasks, previousTask };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([key, previous]) => {
          queryClient.setQueryData(key, previous);
        });
      }
      if (context?.previousTask) {
        queryClient.setQueryData([...TASK_QUERY_KEY, id], context.previousTask);
      }
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...TASK_QUERY_KEY, id],
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTaskVariables) =>
      tasksService.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      const taskQueryKey = [...TASK_QUERY_KEY, id];
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: taskQueryKey });

      const previousTask =
        queryClient.getQueryData<ApiResponse<Task>>(taskQueryKey);
      const previousTasks = queryClient.getQueriesData<InfiniteTasksData>({
        queryKey: TASKS_INFINITE_QUERY_KEY,
      });
      const availableTeams =
        queryClient.getQueryData<ApiResponse<Team[]>>([
          ...TEAMS_QUERY_KEY,
          { limit: 100, offset: 0 },
        ])?.data ?? [];
      const optimisticTask = previousTask
        ? {
            ...previousTask.data,
            ...data,
            title: data.title?.trim() ?? previousTask.data.title,
            description:
              data.description?.trim() ?? previousTask.data.description,
            teams: data.teamIds
              ? availableTeams.filter((team) => data.teamIds?.includes(team.id))
              : previousTask.data.teams,
          }
        : undefined;

      if (previousTask && optimisticTask) {
        queryClient.setQueryData<ApiResponse<Task>>(taskQueryKey, {
          ...previousTask,
          data: optimisticTask,
        });
      }

      queryClient.setQueriesData<InfiniteTasksData>(
        { queryKey: TASKS_INFINITE_QUERY_KEY },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((task) =>
                    task.id === id && optimisticTask ? optimisticTask : task,
                  ),
                })),
              }
            : old,
      );

      return { previousTask, previousTasks };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData([...TASK_QUERY_KEY, id], context.previousTask);
      }
      context?.previousTasks.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
    },
    onSuccess: (response, { id }) => {
      queryClient.setQueryData([...TASK_QUERY_KEY, id], response);
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...TASK_QUERY_KEY, id],
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.deleteTask,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueriesData<InfiniteTasksData>({
        queryKey: TASKS_INFINITE_QUERY_KEY,
      });

      queryClient.setQueriesData<InfiniteTasksData>(
        { queryKey: TASKS_INFINITE_QUERY_KEY },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.filter((task) => task.id !== deletedId),
                  meta: page.meta
                    ? { ...page.meta, total: Math.max(0, page.meta.total - 1) }
                    : undefined,
                })),
              }
            : old,
      );

      return { previousTasks };
    },
    onError: (_error, _deletedId, context) => {
      context?.previousTasks.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

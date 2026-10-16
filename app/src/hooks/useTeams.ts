import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { teamsService } from '../services/teams.service';
import type { TeamsQueryParams, UpdateTeamData } from '../types/teams.types';
import type { InfiniteTeamsData } from '../types/teams.types';
import type { ApiResponse, Team } from '../types';

export const TEAMS_QUERY_KEY = ['teams'];
export const TEAMS_INFINITE_QUERY_KEY = [...TEAMS_QUERY_KEY, 'infinite'];
export const TEAM_QUERY_KEY = ['team'];

export function useTeams(params?: TeamsQueryParams) {
  return useQuery({
    queryKey: [...TEAMS_QUERY_KEY, params],
    queryFn: () => teamsService.getTeams(params),
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteTeams(params: Omit<TeamsQueryParams, 'offset'>) {
  return useInfiniteQuery({
    queryKey: [...TEAMS_INFINITE_QUERY_KEY, params],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      teamsService.getTeams({ ...params, offset: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore
        ? lastPage.meta.offset + lastPage.meta.limit
        : undefined,
  });
}

export function useTeam(id?: string) {
  return useQuery({
    queryKey: [...TEAM_QUERY_KEY, id],
    queryFn: () => teamsService.getTeamById(id!),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsService.createTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY }),
  });
}

export function useUpdateTeam(id: string) {
  const queryClient = useQueryClient();
  const teamQueryKey = [...TEAM_QUERY_KEY, id];

  return useMutation({
    mutationFn: (data: UpdateTeamData) =>
      teamsService.updateTeam(id, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: teamQueryKey });

      const previousTeam = queryClient.getQueryData<ApiResponse<Team>>(teamQueryKey);
      const previousLists = queryClient.getQueriesData<InfiniteTeamsData>({
        queryKey: TEAMS_INFINITE_QUERY_KEY,
      });
      const previousStandardLists = queryClient.getQueriesData<ApiResponse<Team[]>>({
        queryKey: TEAMS_QUERY_KEY,
        predicate: (query) => query.queryKey[1] !== 'infinite',
      });

      if (previousTeam) {
        queryClient.setQueryData<ApiResponse<Team>>(teamQueryKey, {
          ...previousTeam,
          data: {
            ...previousTeam.data,
            ...data,
            name: data.name?.trim() ?? previousTeam.data.name,
          },
        });
      }

      queryClient.setQueriesData<InfiniteTeamsData>(
        { queryKey: TEAMS_INFINITE_QUERY_KEY },
        (previous) =>
          previous
            ? {
                ...previous,
                pages: previous.pages.map((page) => ({
                  ...page,
                  data: page.data.map((team) =>
                    team.id === id
                      ? { ...team, ...data, name: data.name?.trim() ?? team.name }
                      : team,
                  ),
                })),
              }
            : previous,
      );
      queryClient.setQueriesData<ApiResponse<Team[]>>(
        {
          queryKey: TEAMS_QUERY_KEY,
          predicate: (query) => query.queryKey[1] !== 'infinite',
        },
        (previous) =>
          previous
            ? {
                ...previous,
                data: previous.data.map((team) =>
                  team.id === id
                    ? { ...team, ...data, name: data.name?.trim() ?? team.name }
                    : team,
                ),
              }
            : previous,
      );

      return { previousTeam, previousLists, previousStandardLists };
    },
    onError: (_error, _data, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(teamQueryKey, context.previousTeam);
      }
      context?.previousLists.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
      context?.previousStandardLists.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(teamQueryKey, response);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: teamQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsService.deleteTeam,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      const teamQueryKey = [...TEAM_QUERY_KEY, deletedId];
      await queryClient.cancelQueries({ queryKey: teamQueryKey });

      const previousTeam = queryClient.getQueryData<ApiResponse<Team>>(teamQueryKey);
      const previousLists = queryClient.getQueriesData<InfiniteTeamsData>({
        queryKey: TEAMS_INFINITE_QUERY_KEY,
      });
      const previousStandardLists = queryClient.getQueriesData<ApiResponse<Team[]>>({
        queryKey: TEAMS_QUERY_KEY,
        predicate: (query) => query.queryKey[1] !== 'infinite',
      });

      queryClient.setQueriesData<InfiniteTeamsData>(
        { queryKey: TEAMS_INFINITE_QUERY_KEY },
        (previous) =>
          previous
            ? {
                ...previous,
                pages: previous.pages.map((page) => ({
                  ...page,
                  data: page.data.filter((team) => team.id !== deletedId),
                  meta: page.meta
                    ? { ...page.meta, total: Math.max(0, page.meta.total - 1) }
                    : undefined,
                })),
              }
            : previous,
      );
      queryClient.setQueriesData<ApiResponse<Team[]>>(
        {
          queryKey: TEAMS_QUERY_KEY,
          predicate: (query) => query.queryKey[1] !== 'infinite',
        },
        (previous) =>
          previous
            ? {
                ...previous,
                data: previous.data.filter((team) => team.id !== deletedId),
                meta: previous.meta
                  ? { ...previous.meta, total: Math.max(0, previous.meta.total - 1) }
                  : undefined,
              }
            : previous,
      );

      return { previousTeam, teamQueryKey, previousLists, previousStandardLists };
    },
    onError: (_error, _deletedId, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(context.teamQueryKey, context.previousTeam);
      }
      context?.previousLists.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
      context?.previousStandardLists.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
    },
    onSettled: (_data, _error, deletedId) => {
      queryClient.removeQueries({
        queryKey: [...TEAM_QUERY_KEY, deletedId],
      });
      void queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

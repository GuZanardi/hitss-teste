import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { teamsService } from '../services/teams.service';
import { Team, ApiResponse } from '../types';

export const TEAMS_QUERY_KEY = ['teams'];

export function useTeams(params?: { search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...TEAMS_QUERY_KEY, params],
    queryFn: () => teamsService.getTeams(params),
    placeholderData: keepPreviousData,
  });
}

export function useTeam(id?: string) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsService.getTeamById(id!),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsService.deleteTeam(id),
    // Optimistic update na exclusão de times
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });

      const previousQueriesData = queryClient.getQueriesData<ApiResponse<Team[]>>({
        queryKey: TEAMS_QUERY_KEY,
      });

      // Aplica atualização otimista removendo o time imediatamente das listagens cacheadas
      queryClient.setQueriesData<ApiResponse<Team[]>>(
        { queryKey: TEAMS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((team) => team.id !== deletedId),
            meta: old.meta
              ? { ...old.meta, total: Math.max(0, old.meta.total - 1) }
              : undefined,
          };
        },
      );

      return { previousQueriesData };
    },
    onError: (_err, _deletedId, context) => {
      // Rollback se falhar
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

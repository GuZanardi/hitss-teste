import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { Header, TeamCard, Button } from '../../components';
import { teamsListService } from './service';
import { TeamsListNavigationProp, TeamsListResponse } from './types';
import { getErrorMessage } from '../../utils/errors';

export const TeamsListScreen: React.FC = () => {
  const navigation = useNavigation<TeamsListNavigationProp>();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const PAGE_SIZE = 10;
  const queryKey = ['teams', 'infinite', { search: search.trim(), limit: PAGE_SIZE }];

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      teamsListService.fetchTeams({
        search: search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore
        ? lastPage.meta.offset + lastPage.meta.limit
        : undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsListService.deleteTeam(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['teams'] });
      const previousData = queryClient.getQueriesData<
        InfiniteData<TeamsListResponse>
      >({
        queryKey: ['teams', 'infinite'],
      });

      queryClient.setQueriesData<InfiniteData<TeamsListResponse>>(
        { queryKey: ['teams', 'infinite'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((team) => team.id !== deletedId),
              meta: page.meta
                ? { ...page.meta, total: Math.max(0, page.meta.total - 1) }
                : undefined,
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      Alert.alert(
        'Erro ao excluir time',
        getErrorMessage(_err, 'Não foi possível excluir o time.'),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const teams = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta?.total;

  return (
    <View className="flex-1 bg-background" style={styles.container}>
      <Header title="Times" subtitle="Acesse um dos times" />

      {/* Input de busca conforme Figma */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busque um time"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={setSearch}
        />
        <Search color="#00B37E" size={20} style={styles.searchIcon} />
      </View>

      {/* Lista de times */}
      {isLoading && teams.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#00B37E" size="large" />
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isFetchingNextPage}
              onRefresh={() => void refetch()}
              tintColor="#00B37E"
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={() =>
                navigation.navigate('TasksList', {
                  initialTeamId: item.id,
                  teamName: item.name,
                })
              }
              onEdit={() => navigation.navigate('EditTeam', { teamId: item.id })}
              onDelete={() => deleteMutation.mutate(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search ? 'Nenhum time encontrado para a busca.' : 'Nenhum time cadastrado ainda.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#00B37E" style={styles.footerLoader} />
            ) : hasNextPage ? (
              <Text style={styles.moreItemsText}>
                {total ? `Mais times disponíveis (${total})` : ''}
              </Text>
            ) : null
          }
        />
      )}

      {/* Botão inferior fixo verde */}
      <View style={styles.footer}>
        <Button
          title="Criar time"
          onPress={() => navigation.navigate('CreateTeam')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#202024',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#29292E',
    height: 52,
    color: '#FFFFFF',
    paddingLeft: 16,
    paddingRight: 48,
    fontSize: 15,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8D8D99',
    fontSize: 14,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  moreItemsText: {
    color: '#8D8D99',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    paddingVertical: 16,
    backgroundColor: '#121214',
  },
});

export * from './types';
export * from './service';

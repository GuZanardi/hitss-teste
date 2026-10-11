import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { Header, TeamCard, Button } from '../../components';
import { teamsListService } from './service';
import { TeamsListNavigationProp, TeamsListResponse } from './types';

export const TeamsListScreen: React.FC = () => {
  const navigation = useNavigation<TeamsListNavigationProp>();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 10;

  // React Query consumindo o service dedicado da tela
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['teams', { search, limit: PAGE_SIZE, offset }],
    queryFn: () => teamsListService.fetchTeams({ search, limit: PAGE_SIZE, offset }),
    keepPreviousData: true,
  } as any);

  // Optimistic update na exclusão de times
  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsListService.deleteTeam(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['teams'] });
      const previousData = queryClient.getQueriesData<TeamsListResponse>({
        queryKey: ['teams'],
      });

      queryClient.setQueriesData<TeamsListResponse>(
        { queryKey: ['teams'] },
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

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const teams = data?.data || [];
  const meta = data?.meta;

  const handleNextPage = () => {
    if (meta?.hasMore && !isFetching) {
      setOffset((prev) => prev + PAGE_SIZE);
    }
  };

  const handlePrevPage = () => {
    if (offset > 0 && !isFetching) {
      setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Times" subtitle="Acesse um dos times" />

      {/* Input de busca conforme Figma */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busque um time"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setOffset(0);
          }}
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
              refreshing={isFetching && offset === 0}
              onRefresh={() => {
                setOffset(0);
                refetch();
              }}
              tintColor="#00B37E"
            />
          }
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={() =>
                navigation.navigate('TasksList', {
                  initialTeamId: item.id,
                  teamName: item.name,
                })
              }
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
            meta && meta.total > PAGE_SIZE ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  disabled={offset === 0 || isFetching}
                  onPress={handlePrevPage}
                  style={[
                    styles.paginationButton,
                    offset === 0 ? styles.paginationDisabled : null,
                  ]}
                >
                  <Text style={styles.paginationText}>Anterior</Text>
                </TouchableOpacity>

                <Text style={styles.paginationInfo}>
                  {offset + 1} - {Math.min(offset + PAGE_SIZE, meta.total)} de {meta.total}
                </Text>

                <TouchableOpacity
                  disabled={!meta.hasMore || isFetching}
                  onPress={handleNextPage}
                  style={[
                    styles.paginationButton,
                    !meta.hasMore ? styles.paginationDisabled : null,
                  ]}
                >
                  <Text style={styles.paginationText}>Próxima</Text>
                </TouchableOpacity>
              </View>
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
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#29292E',
    marginTop: 8,
  },
  paginationButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#202024',
    borderRadius: 6,
  },
  paginationDisabled: {
    opacity: 0.4,
  },
  paginationText: {
    color: '#00B37E',
    fontWeight: '600',
    fontSize: 13,
  },
  paginationInfo: {
    color: '#8D8D99',
    fontSize: 12,
  },
  footer: {
    paddingVertical: 16,
    backgroundColor: '#121214',
  },
});

export * from './types';
export * from './service';


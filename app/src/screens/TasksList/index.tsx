import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { Button, Dropdown, Header, TaskCard } from '../../components';
import { DropdownItem } from '../../components/Dropdown/types';
import { useTasks, useUpdateTaskStatus } from '../../hooks/useTasks';
import { RootStackParamList, TaskStatus } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { TasksListRouteProp } from './types';
import { tasksListService } from './service';

const PAGE_SIZE = 10;

const STATUS_FILTERS: Array<{ label: string; value?: TaskStatus }> = [
  { label: 'Todas' },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Em progresso', value: 'IN_PROGRESS' },
  { label: 'Concluída', value: 'COMPLETED' },
];

export const TasksListScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'TasksList'>>();
  const route = useRoute<TasksListRouteProp>();
  const [search, setSearch] = useState('');
  const [teamId, setTeamId] = useState(route.params?.initialTeamId ?? '');
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (route.params?.initialTeamId) {
      setTeamId(route.params.initialTeamId);
      setOffset(0);
    }
  }, [route.params?.initialTeamId]);

  const queryParams = {
    teamId: teamId || undefined,
    status,
    search: search.trim() || undefined,
    limit: PAGE_SIZE,
    offset,
    sort: 'createdAt:desc',
  };
  const {
    data: tasksResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTasks(queryParams);
  const {
    data: teamsResponse,
    error: teamsError,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ['teams', { limit: 100, offset: 0 }],
    queryFn: () => tasksListService.getTeams({ limit: 100, offset: 0 }),
  });
  const statusMutation = useUpdateTaskStatus();

  const tasks = tasksResponse?.data ?? [];
  const meta = tasksResponse?.meta;
  const teams: DropdownItem[] = [
    { label: 'Todos os times', value: '' },
    ...(teamsResponse?.data ?? []).map((team) => ({
      label: team.name,
      value: team.id,
      color: team.colorHex,
    })),
  ];

  const changeFilter = (change: () => void) => {
    change();
    setOffset(0);
  };

  const nextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'PENDING') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'COMPLETED';
    return 'PENDING';
  };

  return (
    <View className="flex-1 bg-background" style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="Tarefas"
        subtitle={
          route.params?.teamName
            ? `Tarefas do time ${route.params.teamName}`
            : 'Acompanhe suas tarefas'
        }
      />

      <View style={styles.searchContainer}>
        <TextInput
          accessibilityLabel="Buscar tarefas"
          style={styles.searchInput}
          placeholder="Busque uma tarefa"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={(value) => changeFilter(() => setSearch(value))}
          returnKeyType="search"
        />
        <Search color="#00B37E" size={20} style={styles.searchIcon} />
      </View>

      <Dropdown
        label="Time"
        items={teams}
        value={teamId}
        placeholder="Todos os times"
        onSelect={(value) => changeFilter(() => setTeamId(value))}
      />
      {teamsError ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => void refetchTeams()}
          style={styles.teamErrorContainer}
        >
          <Text style={styles.teamErrorText}>
            {getErrorMessage(teamsError, 'Não foi possível carregar os times.')}
            {'  Tocar para tentar novamente.'}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.statusFilters}>
        {STATUS_FILTERS.map((filter) => {
          const selected = filter.value === status;
          return (
            <TouchableOpacity
              key={filter.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => changeFilter(() => setStatus(filter.value))}
              style={[
                styles.statusFilter,
                selected ? styles.statusFilterActive : null,
              ]}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selected ? styles.statusFilterTextActive : null,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#00B37E" size="large" />
        </View>
      ) : isError && tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {getErrorMessage(error, 'Não foi possível carregar as tarefas.')}
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => {
                setOffset(0);
                void refetch();
              }}
              tintColor="#00B37E"
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() =>
                navigation.navigate('EditTask', { taskId: item.id })
              }
              onQuickToggleStatus={(next) =>
                statusMutation.mutate(
                  { id: item.id, status: next },
                  {
                    onError: (mutationError: unknown) => {
                      Alert.alert(
                        'Não foi possível atualizar a tarefa',
                        getErrorMessage(mutationError, 'Tente novamente.'),
                      );
                    },
                  },
                )
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search || teamId || status
                  ? 'Nenhuma tarefa corresponde aos filtros.'
                  : 'Nenhuma tarefa cadastrada ainda.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            meta && meta.total > PAGE_SIZE ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={offset === 0 || isFetching}
                  onPress={() => setOffset((previous) => Math.max(0, previous - PAGE_SIZE))}
                  style={[
                    styles.paginationButton,
                    offset === 0 ? styles.paginationDisabled : null,
                  ]}
                >
                  <Text style={styles.paginationText}>Anterior</Text>
                </TouchableOpacity>

                <Text style={styles.paginationInfo}>
                  {meta.total === 0 ? 0 : offset + 1} -{' '}
                  {Math.min(offset + PAGE_SIZE, meta.total)} de {meta.total}
                </Text>

                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={!meta.hasMore || isFetching}
                  onPress={() => setOffset((previous) => previous + PAGE_SIZE)}
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

      <View style={styles.footer}>
        <Button
          title="Nova tarefa"
          onPress={() =>
            navigation.navigate('CreateTask', {
              preselectedTeamId: teamId || undefined,
            })
          }
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
    marginBottom: 8,
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
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#202024',
    borderWidth: 1,
    borderColor: '#29292E',
  },
  statusFilterActive: {
    backgroundColor: '#00B37E',
    borderColor: '#00B37E',
  },
  statusFilterText: {
    color: '#C4C4CC',
    fontSize: 12,
    fontWeight: '600',
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#F87171',
    textAlign: 'center',
    fontSize: 14,
  },
  teamErrorContainer: {
    marginBottom: 12,
  },
  teamErrorText: {
    color: '#F87171',
    fontSize: 12,
  },
  retryText: {
    color: '#00B37E',
    fontWeight: '600',
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 12,
    flexGrow: 1,
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

import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TaskStatus } from "../../types";
import { DropdownItem } from "../../components/Dropdown/types";

import { TasksListRouteProp } from "./schema";
import { useTeams } from "../../hooks/useTeams";
import { getErrorMessage } from "../../utils/errors";
import { useDebounce } from "../../hooks/useDebounce";
import { useTasks, useUpdateTaskStatus } from "../../hooks/useTasks";

import { Search } from "lucide-react-native";
import { Button, Dropdown, Header, TaskCard } from "../../components";

const PAGE_SIZE = 10;

const STATUS_FILTERS: Array<{ label: string; value?: TaskStatus }> = [
  { label: "Todas" },
  { label: "Pendente", value: "PENDING" },
  { label: "Em progresso", value: "IN_PROGRESS" },
  { label: "Concluída", value: "COMPLETED" },
];

const SORT_OPTIONS = [
  { label: "Mais recentes", value: "createdAt:desc" },
  { label: "Mais antigas", value: "createdAt:asc" },
  { label: "Título A-Z", value: "title:asc" },
  { label: "Título Z-A", value: "title:desc" },
];

export const TasksListScreen: React.FC = () => {
  const route = useRoute<TasksListRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "TasksList">>();

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamId, setTeamId] = useState(route.params?.initialTeamId ?? "");
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [sort, setSort] = useState("createdAt:desc");
  const debounceSearch = useDebounce(setSearchQuery, 500);

  useEffect(() => {
    if (route.params?.initialTeamId) {
      setTeamId(route.params.initialTeamId);
    }
  }, [route.params?.initialTeamId]);

  const queryParams = {
    teamId: teamId || undefined,
    status,
    search: searchQuery.trim() || undefined,
    limit: PAGE_SIZE,
    sort,
  };
  const {
    data: tasksResponse,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useTasks(queryParams);
  const {
    data: teamsResponse,
    error: teamsError,
    refetch: refetchTeams,
  } = useTeams({ limit: 100, offset: 0 });
  const statusMutation = useUpdateTaskStatus();

  const tasks = tasksResponse?.pages.flatMap((page) => page.data) ?? [];
  const meta = tasksResponse?.pages[0]?.meta;
  const teams: DropdownItem[] = [
    { label: "Todos os times", value: "" },
    ...(teamsResponse?.data ?? []).map((team) => ({
      label: team.name,
      value: team.id,
      color: team.colorHex,
    })),
  ];

  return (
    <View className="flex-1 bg-background" style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="Tarefas"
        subtitle={
          route.params?.teamName
            ? `Tarefas do time ${route.params.teamName}`
            : "Acompanhe suas tarefas"
        }
      />

      <View style={styles.searchContainer}>
        <TextInput
          accessibilityLabel="Buscar tarefas"
          style={styles.searchInput}
          placeholder="Busque uma tarefa"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            debounceSearch(value);
          }}
          returnKeyType="search"
        />
        <Search color="#00B37E" size={20} style={styles.searchIcon} />
      </View>

      <View style={styles.listFilters}>
        <View style={styles.filterDropdown}>
          <Dropdown
            label="Time"
            items={teams}
            value={teamId}
            placeholder="Todos os times"
            onSelect={setTeamId}
          />
        </View>
        <View style={styles.filterDropdown}>
          <Dropdown
            label="Ordenar"
            items={SORT_OPTIONS}
            value={sort}
            onSelect={setSort}
          />
        </View>
      </View>
      {teamsError ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => void refetchTeams()}
          style={styles.teamErrorContainer}
        >
          <Text style={styles.teamErrorText}>
            {getErrorMessage(teamsError, "Não foi possível carregar os times.")}
            {"  Tocar para tentar novamente."}
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
              onPress={() => setStatus(filter.value)}
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
            {getErrorMessage(error, "Não foi possível carregar as tarefas.")}
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
              refreshing={isFetching && !isLoading && !isFetchingNextPage}
              onRefresh={() => void refetch()}
              tintColor="#00B37E"
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() =>
                navigation.navigate("EditTask", { taskId: item.id })
              }
              onQuickToggleStatus={(next) =>
                statusMutation.mutate(
                  { id: item.id, status: next },
                  {
                    onError: (mutationError: unknown) => {
                      Alert.alert(
                        "Não foi possível atualizar a tarefa",
                        getErrorMessage(mutationError, "Tente novamente."),
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
                  ? "Nenhuma tarefa corresponde aos filtros."
                  : "Nenhuma tarefa cadastrada ainda."}
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
                {meta ? `Mais tarefas disponíveis (${meta.total})` : ""}
              </Text>
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        <Button
          title="Nova tarefa"
          onPress={() =>
            navigation.navigate("CreateTask", {
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
    backgroundColor: "#121214",
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 8,
  },
  listFilters: {
    flexDirection: "row",
    gap: 12,
  },
  filterDropdown: {
    flex: 1,
    minWidth: 0,
  },
  searchInput: {
    backgroundColor: "#202024",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#29292E",
    height: 52,
    color: "#FFFFFF",
    paddingLeft: 16,
    paddingRight: 48,
    fontSize: 15,
  },
  searchIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  statusFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#202024",
    borderWidth: 1,
    borderColor: "#29292E",
  },
  statusFilterActive: {
    backgroundColor: "#00B37E",
    borderColor: "#00B37E",
  },
  statusFilterText: {
    color: "#C4C4CC",
    fontSize: 12,
    fontWeight: "600",
  },
  statusFilterTextActive: {
    color: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#F87171",
    textAlign: "center",
    fontSize: 14,
  },
  teamErrorContainer: {
    marginBottom: 12,
  },
  teamErrorText: {
    color: "#F87171",
    fontSize: 12,
  },
  retryText: {
    color: "#00B37E",
    fontWeight: "600",
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#8D8D99",
    fontSize: 14,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
  moreItemsText: {
    color: "#8D8D99",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 8,
  },
  footer: {
    paddingVertical: 16,
    backgroundColor: "#121214",
  },
});

export * from "./schema";

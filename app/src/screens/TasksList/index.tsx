import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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

  const handleQuickToggleStatus = (taskId: string, nextStatus: TaskStatus) => {
    statusMutation.mutate(
      { id: taskId, status: nextStatus },
      {
        onError: (mutationError: unknown) => {
          Alert.alert(
            "Não foi possível atualizar a tarefa",
            getErrorMessage(mutationError, "Tente novamente."),
          );
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background px-5 pt-12">
      <Header
        onBack={() => navigation.goBack()}
        title="Tarefas"
        subtitle={
          route.params?.teamName
            ? `Tarefas do time ${route.params.teamName}`
            : "Acompanhe suas tarefas"
        }
      />

      <View className="relative mb-2">
        <TextInput
          accessibilityLabel="Buscar tarefas"
          className="h-[52px] rounded-lg border border-border bg-surface pl-4 pr-12 text-[15px] text-white"
          placeholder="Busque uma tarefa"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            debounceSearch(value);
          }}
          returnKeyType="search"
        />
        <View className="absolute right-4 top-4">
          <Search color="#00B37E" size={20} />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1">
          <Dropdown
            label="Time"
            items={teams}
            value={teamId}
            placeholder="Todos os times"
            onSelect={setTeamId}
          />
        </View>
        <View className="min-w-0 flex-1">
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
          className="mb-3"
        >
          <Text className="text-xs text-red-400">
            {getErrorMessage(teamsError, "Não foi possível carregar os times.")}
            {"  Tocar para tentar novamente."}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View className="mb-3 flex-row flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const selected = filter.value === status;
          return (
            <TouchableOpacity
              key={filter.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setStatus(filter.value)}
              className={`rounded-full border px-3 py-2 ${
                selected ? 'border-brand bg-brand' : 'border-border bg-surface'
              }`}
            >
              <Text className={`text-xs font-semibold ${selected ? 'text-white' : 'text-[#C4C4CC]'}`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator color="#00B37E" size="large" />
        </View>
      ) : isError && tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-red-400">
            {getErrorMessage(error, "Não foi possível carregar as tarefas.")}
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="mt-3 font-semibold text-brand">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerClassName="flex-grow pb-3"
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
                handleQuickToggleStatus(item.id, next)
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-center text-sm text-textSecondary">
                {search || teamId || status
                  ? "Nenhuma tarefa corresponde aos filtros."
                  : "Nenhuma tarefa cadastrada ainda."}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator color="#00B37E" />
              </View>
            ) : hasNextPage ? (
              <Text className="py-2 text-center text-xs text-textSecondary">
                {meta ? `Mais tarefas disponíveis (${meta.total})` : ""}
              </Text>
            ) : null
          }
        />
      )}

      <View className="bg-background py-4">
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

export * from "./schema";

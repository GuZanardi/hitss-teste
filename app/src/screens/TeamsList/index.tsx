import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { TeamsListNavigationProp } from "./schema";
import { getErrorMessage } from "../../utils/errors";
import { useDebounce } from "../../hooks/useDebounce";
import { useDeleteTeam, useInfiniteTeams } from "../../hooks/useTeams";

import { Search } from "lucide-react-native";
import { Header, TeamCard, Button } from "../../components";

export const TeamsListScreen: React.FC = () => {
  const navigation = useNavigation<TeamsListNavigationProp>();

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const PAGE_SIZE = 10;
  const debounceSearch = useDebounce(setSearchQuery, 500);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteTeams({
    search: searchQuery.trim() || undefined,
    limit: PAGE_SIZE,
  });
  const deleteMutation = useDeleteTeam();

  const teams = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta?.total;

  const handleDeleteTeam = (teamId: string) => {
    deleteMutation.mutate(teamId, {
      onError: (error: unknown) =>
        Alert.alert(
          "Erro ao excluir time",
          getErrorMessage(error, "Não foi possível excluir o time."),
        ),
    });
  };

  return (
    <View className="flex-1 bg-background px-5 pt-12">
      <Header title="Times" subtitle="Acesse um dos times" />

      <View className="relative mb-5">
        <TextInput
          className="h-[52px] rounded-lg border border-border bg-surface pl-4 pr-12 text-[15px] text-white"
          placeholder="Busque um time"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            debounceSearch(value);
          }}
        />
        <View className="absolute right-4 top-4">
          <Search color="#00B37E" size={20} />
        </View>
      </View>

      {isLoading && teams.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00B37E" size="large" />
        </View>
      ) : (
        <FlatList
          className="flex-1"
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
                navigation.navigate("TasksList", {
                  initialTeamId: item.id,
                  teamName: item.name,
                })
              }
              onEdit={() =>
                navigation.navigate("EditTeam", { teamId: item.id })
              }
              onDelete={() => handleDeleteTeam(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-center text-sm text-textSecondary">
                {search
                  ? "Nenhum time encontrado para a busca."
                  : "Nenhum time cadastrado ainda."}
              </Text>
            </View>
          }
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator color="#00B37E" />
              </View>
            ) : hasNextPage ? (
              <Text className="py-2 text-center text-xs text-textSecondary">
                {total ? `Mais times disponíveis (${total})` : ""}
              </Text>
            ) : null
          }
        />
      )}

      <View className="bg-background py-4">
        <Button
          title="Criar time"
          onPress={() => navigation.navigate("CreateTeam")}
        />
      </View>
    </View>
  );
};

export * from "./schema";

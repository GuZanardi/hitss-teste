import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
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

  return (
    <View className="flex-1 bg-background" style={styles.container}>
      <Header title="Times" subtitle="Acesse um dos times" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busque um time"
          placeholderTextColor="#7C7C8A"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            debounceSearch(value);
          }}
        />
        <Search color="#00B37E" size={20} style={styles.searchIcon} />
      </View>

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
                navigation.navigate("TasksList", {
                  initialTeamId: item.id,
                  teamName: item.name,
                })
              }
              onEdit={() =>
                navigation.navigate("EditTeam", { teamId: item.id })
              }
              onDelete={() =>
                deleteMutation.mutate(item.id, {
                  onError: (error: unknown) =>
                    Alert.alert(
                      "Erro ao excluir time",
                      getErrorMessage(
                        error,
                        "Não foi possível excluir o time.",
                      ),
                    ),
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search
                  ? "Nenhum time encontrado para a busca."
                  : "Nenhum time cadastrado ainda."}
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
                {total ? `Mais times disponíveis (${total})` : ""}
              </Text>
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        <Button
          title="Criar time"
          onPress={() => navigation.navigate("CreateTeam")}
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
    marginBottom: 20,
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 24,
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

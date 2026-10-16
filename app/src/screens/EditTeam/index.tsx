import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../types";

import { getErrorMessage } from "../../utils/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { EditTeamFormData, editTeamSchema } from "./schema";
import { useTeam, useUpdateTeam } from "../../hooks/useTeams";

import { Users } from "lucide-react-native";
import { Button, ColorInput, Header, Input } from "../../components";

export const EditTeamScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "EditTeam">>();
  const route = useRoute<RouteProp<RootStackParamList, "EditTeam">>();
  const { teamId } = route.params;
  const { data: teamResponse, isLoading, error } = useTeam(teamId);
  const team = teamResponse?.data;
  const updateMutation = useUpdateTeam(teamId);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: { name: "", colorHex: "#00B37E", description: "" },
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        colorHex: team.colorHex,
        description: team.description ?? "",
      });
    }
  }, [reset, team]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#00B37E" size="large" />
      </View>
    );
  }
  if (error || !team) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadError}>
          {getErrorMessage(error, "Não foi possível carregar o time.")}
        </Text>
        <Button
          title="Voltar"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header
          onBack={() => navigation.goBack()}
          renderIcon={() => <Users color="#00B37E" size={48} />}
          title="Editar Time"
          subtitle="atualize os dados do seu time"
        />
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome do time"
                placeholder="Ex: Squad Mobile"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="colorHex"
            render={({ field: { onChange, value } }) => (
              <ColorInput
                label="Cor do time"
                value={value}
                onChangeColor={onChange}
                error={errors.colorHex?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Descrição (opcional)"
                placeholder="Ex: Equipe responsável pelo app"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={3}
                error={errors.description?.message}
              />
            )}
          />
        </View>
        <View style={styles.footer}>
          <Button
            title="Salvar"
            loading={updateMutation.isPending}
            onPress={handleSubmit((payload) =>
              updateMutation.mutate(
                {
                  name: payload.name.trim(),
                  colorHex: payload.colorHex,
                  description: payload.description?.trim() || undefined,
                },
                {
                  onSuccess: () => navigation.goBack(),
                  onError: (error: unknown) =>
                    Alert.alert(
                      "Erro ao salvar time",
                      getErrorMessage(
                        error,
                        "Não foi possível atualizar o time.",
                      ),
                    ),
                },
              ),
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121214" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#121214",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  form: { marginTop: 8 },
  footer: { marginTop: 24, paddingBottom: 8 },
  loadError: {
    color: "#F87171",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
  },
});

export * from "./schema";

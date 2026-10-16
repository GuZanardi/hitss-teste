import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { DropdownItem } from "../../components/Dropdown/types";
import { RootStackParamList, TaskStatus } from "../../types";

import { useTeams } from "../../hooks/useTeams";
import { getErrorMessage } from "../../utils/errors";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditTaskFormData, editTaskSchema } from "./schema";
import { useDeleteTask, useTask, useUpdateTask } from "../../hooks/useTasks";

import { CheckSquare } from "lucide-react-native";
import {
  Button,
  Dropdown,
  Header,
  Input,
  MultiDropdown,
} from "../../components";

const STATUS_ITEMS: Array<{ label: string; value: TaskStatus }> = [
  { label: "Pendente", value: "PENDING" },
  { label: "Em progresso", value: "IN_PROGRESS" },
  { label: "Concluída", value: "COMPLETED" },
];

export const EditTaskScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "EditTask">>();
  const route = useRoute<RouteProp<RootStackParamList, "EditTask">>();
  const { taskId } = route.params;
  const {
    data: taskResponse,
    isLoading: taskLoading,
    error: taskError,
  } = useTask(taskId);
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useTeams({ limit: 100, offset: 0 });
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const task = taskResponse?.data;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      teamIds: [],
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        teamIds: task.teams.map((team) => team.id),
      });
    }
  }, [reset, task]);

  const teamItems: DropdownItem[] = (teamsResponse?.data ?? []).map((team) => ({
    label: team.name,
    value: team.id,
    color: team.colorHex,
  }));

  const onSubmit = handleSubmit((formData) =>
    updateMutation.mutate(
      {
        id: taskId,
        data: {
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim(),
        },
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: unknown) =>
          Alert.alert(
            "Erro ao salvar tarefa",
            getErrorMessage(error, "Não foi possível atualizar a tarefa."),
          ),
      },
    ),
  );

  const confirmDelete = () => {
    Alert.alert("Excluir tarefa", "Deseja realmente excluir esta tarefa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(taskId, {
            onSuccess: () => navigation.goBack(),
            onError: (error: unknown) =>
              Alert.alert(
                "Erro ao excluir tarefa",
                getErrorMessage(error, "Não foi possível excluir a tarefa."),
              ),
          }),
      },
    ]);
  };

  if (taskLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <ActivityIndicator color="#00B37E" size="large" />
      </View>
    );
  }

  if (taskError || !task) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-center text-sm text-red-400">
          {getErrorMessage(taskError, "Não foi possível carregar a tarefa.")}
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
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-grow justify-between px-5 pb-6 pt-12">
        <Header
          onBack={() => navigation.goBack()}
          onDelete={confirmDelete}
          renderIcon={() => <CheckSquare color="#00B37E" size={44} />}
          title="Editar tarefa"
          subtitle="atualize os dados e o status da tarefa"
        />

        <View className="mt-2">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Título da tarefa"
                placeholder="Ex: Revisar fluxo de cadastro"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                maxLength={120}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Descrição"
                placeholder="Descreva os detalhes da tarefa"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                error={errors.description?.message}
              />
            )}
          />

          {teamsLoading ? (
            <ActivityIndicator color="#00B37E" className="mb-5" />
          ) : teamsError ? (
            <Text className="mb-4 text-center text-sm text-red-400">
              {getErrorMessage(
                teamsError,
                "Não foi possível carregar os times.",
              )}
            </Text>
          ) : (
            <Controller
              control={control}
              name="teamIds"
              render={({ field: { onChange, value } }) => (
                <MultiDropdown
                  label="Times"
                  placeholder="Selecione um ou mais times"
                  items={teamItems}
                  selectedValues={value}
                  onChangeValues={onChange}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                label="Status"
                items={STATUS_ITEMS}
                value={value}
                onSelect={onChange}
              />
            )}
          />
        </View>

        <View className="mt-5 pb-2">
          <Button
            title="Salvar"
            loading={updateMutation.isPending}
            onPress={onSubmit}
          />
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export * from "./schema";

import React from "react";
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
import { RootStackParamList, TaskStatus } from "../../types";
import { DropdownItem } from "../../components/Dropdown/types";

import { useTeams } from "../../hooks/useTeams";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTask } from "../../hooks/useTasks";
import { getErrorMessage } from "../../utils/errors";
import { Controller, useForm } from "react-hook-form";
import { CreateTaskFormData, createTaskSchema } from "./schema";

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

export const CreateTaskScreen: React.FC = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "CreateTask">
    >();
  const route = useRoute<RouteProp<RootStackParamList, "CreateTask">>();
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useTeams({ limit: 100, offset: 0 });
  const createMutation = useCreateTask();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      teamIds: route.params?.preselectedTeamId
        ? [route.params.preselectedTeamId]
        : [],
    },
  });

  const teamItems: DropdownItem[] = (teamsResponse?.data ?? []).map((team) => ({
    label: team.name,
    value: team.id,
    color: team.colorHex,
  }));

  const onSubmit = (formData: CreateTaskFormData) => {
    createMutation.mutate(
      {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        teamIds: formData.teamIds,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: unknown) =>
          Alert.alert(
            "Erro ao criar tarefa",
            getErrorMessage(error, "Não foi possível criar a tarefa."),
          ),
      },
    );
  };

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
          renderIcon={() => <CheckSquare color="#00B37E" size={44} />}
          title="Nova tarefa"
          subtitle="crie uma tarefa para organizar o trabalho"
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
            <Text className="mb-4 text-[13px] text-red-400">
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
            title="Criar tarefa"
            loading={createMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export * from "./schema";

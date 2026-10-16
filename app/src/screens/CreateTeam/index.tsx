import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

import { useCreateTeam } from "../../hooks/useTeams";
import { getErrorMessage } from "../../utils/errors";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTeamSchema, CreateTeamFormData } from "./schema";

import { Users } from "lucide-react-native";
import { Header, Input, ColorInput, Button } from "../../components";

export const CreateTeamScreen: React.FC = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "CreateTeam">
    >();
  const createMutation = useCreateTeam();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      colorHex: "#00B37E",
      description: "",
    },
  });

  const onSubmit = (data: CreateTeamFormData) => {
    createMutation.mutate(
      {
        name: data.name,
        colorHex: data.colorHex,
        description: data.description || undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error: unknown) =>
          Alert.alert(
            "Erro ao criar time",
            getErrorMessage(
              error,
              "Não foi possível criar o time. Verifique os dados.",
            ),
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
          renderIcon={() => <Users color="#00B37E" size={48} />}
          title="Novo Time"
          subtitle="crie seu time para gerenciar as tarefas"
        />

        <View className="mt-2">
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

        <View className="mt-6 pb-2">
          <Button
            title="Criar"
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

import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckSquare } from 'lucide-react-native';
import { Button, Dropdown, Header, Input, MultiDropdown } from '../../components';
import { DropdownItem } from '../../components/Dropdown/types';
import { RootStackParamList, TaskStatus } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { createTaskService } from './service';
import { CreateTaskFormData, createTaskSchema } from './types';

const STATUS_ITEMS: Array<{ label: string; value: TaskStatus }> = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Em progresso', value: 'IN_PROGRESS' },
  { label: 'Concluída', value: 'COMPLETED' },
];

export const CreateTaskScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateTask'>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CreateTask'>>();
  const queryClient = useQueryClient();
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ['teams', { limit: 100, offset: 0 }],
    queryFn: () => createTaskService.getTeams({ limit: 100, offset: 0 }),
  });

  const createMutation = useMutation({
    mutationFn: createTaskService.createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigation.goBack();
    },
    onError: (error: unknown) => {
      Alert.alert(
        'Erro ao criar tarefa',
        getErrorMessage(error, 'Não foi possível criar a tarefa.'),
      );
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
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
    createMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      teamIds: formData.teamIds,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header
          onBack={() => navigation.goBack()}
          renderIcon={() => <CheckSquare color="#00B37E" size={44} />}
          title="Nova tarefa"
          subtitle="crie uma tarefa para organizar o trabalho"
        />

        <View style={styles.form}>
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
            <ActivityIndicator color="#00B37E" style={styles.teamLoader} />
          ) : teamsError ? (
            <Text style={styles.loadError}>
              {getErrorMessage(teamsError, 'Não foi possível carregar os times.')}
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

        <View style={styles.footer}>
          <Button
            title="Criar tarefa"
            loading={createMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  form: {
    marginTop: 8,
  },
  teamLoader: {
    marginBottom: 20,
  },
  loadError: {
    color: '#F87171',
    fontSize: 13,
    marginBottom: 16,
  },
  footer: {
    marginTop: 20,
    paddingBottom: 8,
  },
});

export * from './types';
export * from './service';

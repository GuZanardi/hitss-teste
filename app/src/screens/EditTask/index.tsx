import React, { useEffect } from 'react';
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
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CheckSquare } from 'lucide-react-native';
import { Button, Dropdown, Header, Input, MultiDropdown } from '../../components';
import { DropdownItem } from '../../components/Dropdown/types';
import { ApiResponse, RootStackParamList, Task, TaskStatus } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { editTaskService } from './service';
import { EditTaskFormData, editTaskSchema } from './types';

const STATUS_ITEMS: Array<{ label: string; value: TaskStatus }> = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Em progresso', value: 'IN_PROGRESS' },
  { label: 'Concluída', value: 'COMPLETED' },
];

export const EditTaskScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditTask'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditTask'>>();
  const { taskId } = route.params;
  const queryClient = useQueryClient();
  const {
    data: taskResponse,
    isLoading: taskLoading,
    error: taskError,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => editTaskService.getTask(taskId),
  });
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ['teams', { limit: 100, offset: 0 }],
    queryFn: () => editTaskService.getTeams({ limit: 100, offset: 0 }),
  });

  const task = taskResponse?.data;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
      teamIds: [],
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        teamIds: task.teams.map((team) => team.id),
      });
    }
  }, [reset, task]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditTaskFormData }) =>
      editTaskService.updateTask(id, {
        ...payload,
        title: payload.title.trim(),
        description: payload.description?.trim() || undefined,
      }),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['task', id] });

      const previousTask =
        queryClient.getQueryData<ApiResponse<Task>>(['task', id]);
      const previousTasks = queryClient.getQueriesData<ApiResponse<Task[]>>({
        queryKey: ['tasks'],
      });

      if (payload.status) {
        if (previousTask) {
          queryClient.setQueryData<ApiResponse<Task>>(['task', id], {
            ...previousTask,
            data: { ...previousTask.data, status: payload.status },
          });
        }

        queryClient.setQueriesData<ApiResponse<Task[]>>(
          { queryKey: ['tasks'] },
          (previous) =>
            previous
              ? {
                  ...previous,
                  data: previous.data.map((item) =>
                    item.id === id
                      ? { ...item, status: payload.status }
                      : item,
                  ),
                }
              : previous,
        );
      }

      return { previousTask, previousTasks };
    },
    onError: (error: unknown, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['task', id], context.previousTask);
      }
      context?.previousTasks.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
      Alert.alert(
        'Erro ao salvar tarefa',
        getErrorMessage(error, 'Não foi possível atualizar a tarefa.'),
      );
    },
    onSuccess: () => navigation.goBack(),
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: editTaskService.deleteTask,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueriesData<ApiResponse<Task[]>>({
        queryKey: ['tasks'],
      });

      queryClient.setQueriesData<ApiResponse<Task[]>>(
        { queryKey: ['tasks'] },
        (previous) =>
          previous
            ? {
                ...previous,
                data: previous.data.filter((item) => item.id !== deletedId),
                meta: previous.meta
                  ? {
                      ...previous.meta,
                      total: Math.max(0, previous.meta.total - 1),
                    }
                  : undefined,
              }
            : previous,
      );

      return { previousTasks };
    },
    onError: (error: unknown, _deletedId, context) => {
      context?.previousTasks.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
      Alert.alert(
        'Erro ao excluir tarefa',
        getErrorMessage(error, 'Não foi possível excluir a tarefa.'),
      );
    },
    onSuccess: () => navigation.goBack(),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const teamItems: DropdownItem[] = (teamsResponse?.data ?? []).map((team) => ({
    label: team.name,
    value: team.id,
    color: team.colorHex,
  }));

  const confirmDelete = () => {
    Alert.alert('Excluir tarefa', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(taskId),
      },
    ]);
  };

  if (taskLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#00B37E" size="large" />
      </View>
    );
  }

  if (taskError || !task) {
    return (
      <View className="flex-1 bg-background" style={styles.centerContainer}>
        <Text style={styles.loadError}>
          {getErrorMessage(taskError, 'Não foi possível carregar a tarefa.')}
        </Text>
        <Button title="Voltar" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

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
          onDelete={confirmDelete}
          renderIcon={() => <CheckSquare color="#00B37E" size={44} />}
          title="Editar tarefa"
          subtitle="atualize os dados e o status da tarefa"
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
            title="Salvar"
            loading={updateMutation.isPending}
            onPress={handleSubmit((formData) =>
              updateMutation.mutate({ id: taskId, payload: formData }),
            )}
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  form: {
    marginTop: 8,
  },
  teamLoader: {
    marginBottom: 20,
  },
  loadError: {
    color: '#F87171',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    marginTop: 20,
    paddingBottom: 8,
  },
});

export * from './types';
export * from './service';

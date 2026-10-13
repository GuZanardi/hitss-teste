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
import { InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react-native';
import { Button, ColorInput, Header, Input } from '../../components';
import { ApiResponse, RootStackParamList, Team } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { editTeamService } from './service';
import { EditTeamFormData, editTeamSchema } from './types';
import { TeamsListResponse } from '../TeamsList/types';

export const EditTeamScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditTeam'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditTeam'>>();
  const { teamId } = route.params;
  const queryClient = useQueryClient();
  const {
    data: teamResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => editTeamService.getTeam(teamId),
  });
  const team = teamResponse?.data;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: { name: '', colorHex: '#00B37E', description: '' },
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        colorHex: team.colorHex,
        description: team.description ?? '',
      });
    }
  }, [reset, team]);

  const updateMutation = useMutation({
    mutationFn: (payload: EditTeamFormData) =>
      editTeamService.updateTeam(teamId, {
        name: payload.name.trim(),
        colorHex: payload.colorHex,
        description: payload.description?.trim() || undefined,
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['teams'] });
      await queryClient.cancelQueries({ queryKey: ['team', teamId] });
      const previousTeam = queryClient.getQueryData<ApiResponse<Team>>([
        'team',
        teamId,
      ]);
      const previousLists = queryClient.getQueriesData<
        InfiniteData<TeamsListResponse>
      >({ queryKey: ['teams', 'infinite'] });
      if (!team) return { previousTeam, previousLists };
      const optimisticTeam = {
        ...team,
        ...payload,
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
      };

      if (previousTeam) {
        queryClient.setQueryData<ApiResponse<Team>>(['team', teamId], {
          ...previousTeam,
          data: optimisticTeam,
        });
      }
      queryClient.setQueriesData<InfiniteData<TeamsListResponse>>(
        { queryKey: ['teams', 'infinite'] },
        (previous) =>
          previous
            ? {
                ...previous,
                pages: previous.pages.map((page) => ({
                  ...page,
                  data: page.data.map((item) =>
                    item.id === teamId ? optimisticTeam : item,
                  ),
                })),
              }
            : previous,
      );
      return { previousTeam, previousLists };
    },
    onError: (mutationError: unknown, _payload, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(['team', teamId], context.previousTeam);
      }
      context?.previousLists.forEach(([key, previous]) => {
        queryClient.setQueryData(key, previous);
      });
      Alert.alert(
        'Erro ao salvar time',
        getErrorMessage(mutationError, 'Não foi possível atualizar o time.'),
      );
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['team', teamId], response);
      navigation.goBack();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      void queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

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
          {getErrorMessage(error, 'Não foi possível carregar o time.')}
        </Text>
        <Button title="Voltar" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            onPress={handleSubmit((payload) => updateMutation.mutate(payload))}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
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
  form: { marginTop: 8 },
  footer: { marginTop: 24, paddingBottom: 8 },
  loadError: {
    color: '#F87171',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
});

export * from './service';
export * from './types';

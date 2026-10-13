import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react-native';
import { Header, Input, ColorInput, Button } from '../../components';
import { createTeamService } from './service';
import { createTeamSchema, CreateTeamFormData } from './types';
import { getErrorMessage } from '../../utils/errors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

export const CreateTeamScreen: React.FC = () => {
  const navigation = useNavigation<
    NativeStackNavigationProp<RootStackParamList, 'CreateTeam'>
  >();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTeamService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      navigation.goBack();
    },
    onError: (error: unknown) => {
      Alert.alert(
        'Erro ao criar time',
        getErrorMessage(error, 'Não foi possível criar o time. Verifique os dados.'),
      );
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      colorHex: '#00B37E',
      description: '',
    },
  });

  const onSubmit = (data: CreateTeamFormData) => {
    createMutation.mutate({
      name: data.name,
      colorHex: data.colorHex,
      description: data.description || undefined,
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
          renderIcon={() => <Users color="#00B37E" size={48} />}
          title="Novo Time"
          subtitle="crie seu time para gerenciar as tarefas"
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
            title="Criar"
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
  footer: {
    marginTop: 24,
    paddingBottom: 8,
  },
});

export * from './types';
export * from './service';

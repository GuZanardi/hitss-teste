import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TaskStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { TaskCardProps } from './types';
import { teamColorClass } from '../../utils/teamColorClass';

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onQuickToggleStatus,
}) => {
  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'PENDING') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'COMPLETED';
    return 'PENDING';
  };

  const formattedDate = new Date(task.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mb-3 rounded-lg border border-border bg-surface p-4"
    >
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="mr-2 flex-1 text-base font-bold text-white" numberOfLines={1}>
          {task.title}
        </Text>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            if (onQuickToggleStatus) {
              onQuickToggleStatus(getNextStatus(task.status));
            }
          }}
        >
          <StatusBadge status={task.status} />
        </TouchableOpacity>
      </View>

      <View className="mb-2 flex-row flex-wrap gap-1.5">
        {task.teams && task.teams.length > 0 ? (
          task.teams.map((team) => (
            <View key={team.id} className="flex-row items-center gap-1 rounded bg-background px-2 py-[3px]">
              <View className={`h-1.5 w-1.5 rounded-full ${teamColorClass(team.colorHex)}`} />
              <Text className="text-xs font-medium text-[#C4C4CC]">{team.name}</Text>
            </View>
          ))
        ) : (
          <Text className="text-xs italic text-[#7C7C8A]">Sem time atribuído</Text>
        )}
      </View>

      {task.description ? (
        <Text className="mb-2 text-[13px] leading-[18px] text-textSecondary" numberOfLines={3}>
          {task.description}
        </Text>
      ) : null}

      <View className="mt-1 flex-row justify-end border-t border-border pt-2">
        <Text className="text-[11px] text-[#7C7C8A]">Criada em {formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

export * from './types';

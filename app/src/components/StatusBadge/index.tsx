import React from 'react';
import { View, Text } from 'react-native';
import { StatusBadgeProps } from './types';

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let label = 'pendente';
  let backgroundClass = 'bg-status-pendingBg';
  let textClass = 'text-status-pending';

  if (status === 'IN_PROGRESS') {
    label = 'em progresso';
    backgroundClass = 'bg-status-progressBg';
    textClass = 'text-status-progress';
  } else if (status === 'COMPLETED') {
    label = 'concluída';
    backgroundClass = 'bg-status-completedBg';
    textClass = 'text-status-completed';
  }

  return (
    <View className={`self-start rounded-full px-2.5 py-[3px] ${backgroundClass}`}>
      <Text className={`text-[11px] font-semibold lowercase ${textClass}`}>{label}</Text>
    </View>
  );
};

export * from './types';

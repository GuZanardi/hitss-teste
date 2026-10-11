import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBadgeProps } from './types';

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let label = 'pendente';
  let bgColor = '#451A1A';
  let textColor = '#F87171';

  if (status === 'IN_PROGRESS') {
    label = 'em progresso';
    bgColor = '#45321A';
    textColor = '#FBBF24';
  } else if (status === 'COMPLETED') {
    label = 'concluída';
    bgColor = '#1A4532';
    textColor = '#34D399';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
});

export * from './types';


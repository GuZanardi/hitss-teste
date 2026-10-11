import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { TaskCardProps } from './types';

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
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
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

      <View style={styles.teamsRow}>
        {task.teams && task.teams.length > 0 ? (
          task.teams.map((team) => (
            <View key={team.id} style={styles.teamChip}>
              <View
                style={[
                  styles.teamColorDot,
                  { backgroundColor: team.colorHex || '#00B37E' },
                ]}
              />
              <Text style={styles.teamNameText}>{team.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTeamText}>Sem time atribuído</Text>
        )}
      </View>

      {task.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>Criada em {formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#29292E',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  teamsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 5,
  },
  teamColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  teamNameText: {
    color: '#C4C4CC',
    fontSize: 12,
    fontWeight: '500',
  },
  noTeamText: {
    color: '#7C7C8A',
    fontSize: 12,
    fontStyle: 'italic',
  },
  description: {
    color: '#8D8D99',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#29292E',
    paddingTop: 8,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dateText: {
    color: '#7C7C8A',
    fontSize: 11,
  },
});

export * from './types';


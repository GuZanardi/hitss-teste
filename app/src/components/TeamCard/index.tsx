import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Users, ChevronRight } from 'lucide-react-native';
import { TeamCardProps } from './types';

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onPress,
  onDelete,
}) => {
  const handleLongPress = () => {
    if (!onDelete) return;

    Alert.alert(
      'Excluir Time',
      `Deseja realmente excluir o time "${team.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={styles.card}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Users color={team.colorHex || '#00B37E'} size={24} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {team.name}
          </Text>
          {team.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {team.description}
            </Text>
          ) : null}
        </View>
      </View>

      <ChevronRight color="#7C7C8A" size={20} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#202024',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#29292E',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#8D8D99',
    fontSize: 12,
    marginTop: 2,
  },
});

export * from './types';


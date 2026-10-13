import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { HeaderProps } from './types';

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  onDelete,
  renderIcon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topNavigation}>
        {onBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.navButton}
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {onDelete ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Excluir"
            activeOpacity={0.7}
            onPress={onDelete}
            style={styles.navButton}
          >
            <Trash2 color="#F87171" size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {renderIcon ? (
        <View style={styles.centerIconContainer}>
          {renderIcon()}
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 36,
    alignItems: 'center',
  },
  navButton: {
    padding: 6,
  },
  placeholder: {
    width: 36,
  },
  centerIconContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#8D8D99',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});

export * from './types';

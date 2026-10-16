import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View className="mb-6 items-center pt-2">
      <View className="min-h-9 w-full flex-row items-center justify-between">
        {onBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            activeOpacity={0.7}
            onPress={onBack}
            className="p-1.5"
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
        ) : (
          <View className="w-9" />
        )}

        {onDelete ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Excluir"
            activeOpacity={0.7}
            onPress={onDelete}
            className="p-1.5"
          >
            <Trash2 color="#F87171" size={24} />
          </TouchableOpacity>
        ) : (
          <View className="w-9" />
        )}
      </View>

      {renderIcon ? (
        <View className="mb-3 mt-2">
          {renderIcon()}
        </View>
      ) : null}

      <Text className="text-center text-[22px] font-bold text-white">{title}</Text>
      {subtitle ? <Text className="mt-1 text-center text-sm text-textSecondary">{subtitle}</Text> : null}
    </View>
  );
};

export * from './types';

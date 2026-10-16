import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  ...props
}) => {
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={`h-[52px] w-full items-center justify-center rounded-lg ${
        disabled
          ? 'bg-surfaceLight'
          : isDanger
            ? 'bg-red-600'
            : isSecondary
              ? 'bg-surfaceLight'
              : 'bg-brand'
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text className={`text-base font-semibold ${disabled ? 'text-textSecondary' : 'text-white'}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export * from './types';

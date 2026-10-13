import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}) => {
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  let bgColor = '#00B37E';
  if (isDanger) bgColor = '#DC2626';
  if (isSecondary) bgColor = '#29292E';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: disabled ? '#29292E' : bgColor,
          height: 52,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text
          style={{
            color: disabled ? '#8D8D99' : '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export * from './types';

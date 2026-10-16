import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { InputProps } from './types';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <View className="mb-4 w-full">
      {label ? <Text className="mb-2 text-sm font-medium text-[#E1E1E6]">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#7C7C8A"
        className={`rounded-lg border bg-background px-4 text-base text-white ${
          props.multiline
            ? 'h-[110px] py-3.5'
            : 'h-[52px]'
        } ${error ? 'border-red-500' : 'border-border'}`}
        {...props}
      />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
};

export * from './types';

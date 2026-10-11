import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { InputProps } from './types';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#7C7C8A"
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.multilineInput : null,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#E1E1E6',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#29292E',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  multilineInput: {
    height: 110,
    textAlignVertical: 'top',
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export * from './types';


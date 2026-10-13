import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { ColorInputProps } from './types';

const PRESET_COLORS = [
  '#00B37E',
  '#F59E0B',
  '#0284C7',
  '#7C3AED',
  '#E11D48',
  '#EA580C',
  '#4F46E5',
  '#16A34A',
  '#DB2777',
  '#0891B2',
  '#A16207',
  '#9333EA',
  '#65A30D',
  '#C026D3',
  '#475569',
];

export const ColorInput: React.FC<ColorInputProps> = ({
  label,
  value,
  onChangeColor,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedColor = value || '#00B37E';

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[styles.inputContainer, error ? styles.inputError : null]}
      >
        <Text style={styles.inputText}>
          {value ? value.toUpperCase() : 'Selecione uma cor'}
        </Text>

        <View style={[styles.colorIndicator, { backgroundColor: selectedColor }]} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha a cor do time</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#8D8D99" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.colorGrid}>
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor.toUpperCase() === color.toUpperCase();
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar cor ${color}`}
                    key={color}
                    activeOpacity={0.7}
                    onPress={() => {
                      onChangeColor(color);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      isSelected ? styles.selectedColorCircle : null,
                    ]}
                  >
                    {isSelected ? <Check color="#FFFFFF" size={18} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  inputContainer: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#29292E',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  inputText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#323238',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#202024',
    borderRadius: 12,
    width: '100%',
    maxWidth: 340,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2E2E38',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  selectedColorCircle: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export * from './types';

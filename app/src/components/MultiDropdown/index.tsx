import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { MultiDropdownProps } from './types';

export const MultiDropdown: React.FC<MultiDropdownProps> = ({
  label,
  placeholder = 'Selecione os times (opcional)',
  items,
  selectedValues,
  onChangeValues,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleItem = (val: string) => {
    if (selectedValues.includes(val)) {
      onChangeValues(selectedValues.filter((v) => v !== val));
    } else {
      onChangeValues([...selectedValues, val]);
    }
  };

  const selectedItems = items.filter((item) => selectedValues.includes(item.value));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[styles.selector, error ? styles.selectorError : null]}
      >
        <View style={styles.selectedChipsContainer}>
          {selectedItems.length === 0 ? (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          ) : (
            selectedItems.map((item) => (
              <View
                key={item.value}
                style={[
                  styles.chip,
                  { borderColor: item.color || '#00B37E' },
                ]}
              >
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: item.color || '#00B37E' },
                  ]}
                />
                <Text style={styles.chipText}>{item.label}</Text>
              </View>
            ))
          )}
        </View>

        <ChevronDown color="#7C7C8A" size={20} />
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
              <Text style={styles.modalTitle}>
                {label || 'Selecione um ou mais times'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#8D8D99" size={20} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Uma tarefa pode pertencer a nenhum ou múltiplos times.
            </Text>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = selectedValues.includes(item.value);
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    onPress={() => toggleItem(item.value)}
                    style={[
                      styles.optionItem,
                      isSelected ? styles.selectedOptionItem : null,
                    ]}
                  >
                    <View style={styles.optionInfo}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected ? styles.checkboxActive : null,
                        ]}
                      >
                        {isSelected ? <Check color="#FFFFFF" size={14} /> : null}
                      </View>

                      {item.color ? (
                        <View
                          style={[
                            styles.chipDot,
                            { backgroundColor: item.color },
                          ]}
                        />
                      ) : null}

                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected ? styles.selectedOptionLabel : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum time disponível.</Text>
              }
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(false)}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>Concluir seleção</Text>
            </TouchableOpacity>
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
  selector: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#29292E',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 52,
    paddingVertical: 8,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    paddingRight: 8,
  },
  placeholderText: {
    color: '#7C7C8A',
    fontSize: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202024',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  selectorError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#202024',
    borderRadius: 12,
    width: '100%',
    maxWidth: 340,
    maxHeight: '75%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2E2E38',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSub: {
    color: '#8D8D99',
    fontSize: 12,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedOptionItem: {
    backgroundColor: '#29292E',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7C7C8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00B37E',
    borderColor: '#00B37E',
  },
  optionLabel: {
    color: '#C4C4CC',
    fontSize: 15,
  },
  selectedOptionLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    color: '#7C7C8A',
    textAlign: 'center',
    paddingVertical: 20,
  },
  confirmButton: {
    backgroundColor: '#00B37E',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});

export * from './types';

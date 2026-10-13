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
import { DropdownProps, DropdownItem } from './types';

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Selecione uma opção',
  items,
  value,
  onSelect,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedItem = items.find((item) => item.value === value);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[styles.selector, error ? styles.selectorError : null]}
      >
        <View style={styles.selectionInfo}>
          {selectedItem?.color ? (
            <View
              style={[
                styles.itemColorDot,
                { backgroundColor: selectedItem.color },
              ]}
            />
          ) : null}
          <Text
            style={[
              styles.selectorText,
              !selectedItem ? styles.placeholderText : null,
            ]}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
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
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#8D8D99" size={20} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item.value);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.optionItem,
                      isSelected ? styles.selectedOptionItem : null,
                    ]}
                  >
                    <View style={styles.selectionInfo}>
                      {item.color ? (
                        <View
                          style={[
                            styles.itemColorDot,
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

                    {isSelected ? <Check color="#00B37E" size={18} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
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
    height: 52,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#7C7C8A',
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
    maxHeight: '70%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2E2E38',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E38',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectedOptionItem: {
    backgroundColor: '#29292E',
  },
  optionLabel: {
    color: '#C4C4CC',
    fontSize: 15,
  },
  selectedOptionLabel: {
    color: '#00B37E',
    fontWeight: '600',
  },
});

export * from './types';

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { DropdownProps, DropdownItem } from './types';
import { teamColorClass } from '../../utils/teamColorClass';

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
    <View className="mb-4 w-full">
      {label ? <Text className="mb-2 text-sm font-medium text-[#E1E1E6]">{label}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        className={`h-[52px] flex-row items-center justify-between rounded-lg border bg-background px-4 ${
          error ? 'border-red-500' : 'border-border'
        }`}
      >
        <View className="flex-1 flex-row items-center gap-2.5">
          {selectedItem?.color ? (
            <View className={`h-3 w-3 rounded-full ${teamColorClass(selectedItem.color)}`} />
          ) : null}
          <Text
            className={`text-base ${selectedItem ? 'text-white' : 'text-[#7C7C8A]'}`}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
        </View>

        <ChevronDown color="#7C7C8A" size={20} />
      </TouchableOpacity>

      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/70 p-6">
          <View className="max-h-[70%] w-full max-w-[340px] rounded-xl border border-[#2E2E38] bg-surface p-5">
            <View className="mb-4 flex-row items-center justify-between border-b border-[#2E2E38] pb-3">
              <Text className="text-base font-semibold text-white">{label || placeholder}</Text>
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
                    className={`flex-row items-center justify-between rounded-md px-3 py-3.5 ${
                      isSelected ? 'bg-border' : ''
                    }`}
                  >
                    <View className="flex-1 flex-row items-center gap-2.5">
                      {item.color ? (
                        <View className={`h-3 w-3 rounded-full ${teamColorClass(item.color)}`} />
                      ) : null}
                      <Text
                        className={`text-[15px] ${
                          isSelected ? 'font-semibold text-brand' : 'text-[#C4C4CC]'
                        }`}
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

export * from './types';

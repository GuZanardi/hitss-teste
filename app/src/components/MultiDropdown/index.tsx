import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { MultiDropdownProps } from './types';
import { teamColorClass } from '../../utils/teamColorClass';

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
    <View className="mb-4 w-full">
      {label ? <Text className="mb-2 text-sm font-medium text-[#E1E1E6]">{label}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        className={`min-h-[52px] flex-row items-center justify-between rounded-lg border bg-background px-4 py-2 ${
          error ? 'border-red-500' : 'border-border'
        }`}
      >
        <View className="flex-1 flex-row flex-wrap gap-1.5 pr-2">
          {selectedItems.length === 0 ? (
            <Text className="text-base text-[#7C7C8A]">{placeholder}</Text>
          ) : (
            selectedItems.map((item) => (
              <View
                key={item.value}
                className={`flex-row items-center gap-1.5 rounded-md border bg-surface px-2 py-1 ${teamColorClass(item.color, 'border')}`}
              >
                <View className={`h-2 w-2 rounded-full ${teamColorClass(item.color)}`} />
                <Text className="text-xs font-medium text-white">{item.label}</Text>
              </View>
            ))
          )}
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
          <View className="max-h-[75%] w-full max-w-[340px] rounded-xl border border-[#2E2E38] bg-surface p-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">
                {label || 'Selecione um ou mais times'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#8D8D99" size={20} />
              </TouchableOpacity>
            </View>

            <Text className="mb-4 text-xs text-textSecondary">
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
                    className={`mb-1 flex-row items-center justify-between rounded-md px-2.5 py-3 ${
                      isSelected ? 'bg-border' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View
                        className={`h-5 w-5 items-center justify-center rounded border-[1.5px] ${
                          isSelected ? 'border-brand bg-brand' : 'border-[#7C7C8A]'
                        }`}
                      >
                        {isSelected ? <Check color="#FFFFFF" size={14} /> : null}
                      </View>

                      {item.color ? (
                        <View className={`h-2 w-2 rounded-full ${teamColorClass(item.color)}`} />
                      ) : null}

                      <Text
                        className={`text-[15px] ${
                          isSelected ? 'font-semibold text-white' : 'text-[#C4C4CC]'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text className="py-5 text-center text-[#7C7C8A]">Nenhum time disponível.</Text>
              }
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(false)}
              className="mt-4 h-11 items-center justify-center rounded-lg bg-brand"
            >
              <Text className="text-[15px] font-semibold text-white">Concluir seleção</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export * from './types';

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { ColorInputProps } from './types';
import { teamColorClass } from '../../utils/teamColorClass';

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
    <View className="mb-4 w-full">
      {label ? <Text className="mb-2 text-sm font-medium text-[#E1E1E6]">{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        className={`h-[52px] flex-row items-center justify-between rounded-lg border bg-background px-4 ${
          error ? 'border-red-500' : 'border-border'
        }`}
      >
        <Text className="text-base font-medium text-white">
          {value ? value.toUpperCase() : 'Selecione uma cor'}
        </Text>

        <View className={`h-5 w-5 rounded-full border-[1.5px] border-[#323238] ${teamColorClass(selectedColor)}`} />
      </TouchableOpacity>

      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 p-6">
          <View className="w-full max-w-[340px] rounded-xl border border-[#2E2E38] bg-surface p-5">
            <View className="mb-[18px] flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">Escolha a cor do time</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#8D8D99" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="flex-row flex-wrap justify-between gap-3">
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
                    className={`my-1 h-12 w-12 items-center justify-center rounded-full ${teamColorClass(color)} ${
                      isSelected ? 'border-2 border-white' : ''
                    }`}
                  >
                    {isSelected ? <Check color="#FFFFFF" size={18} /> : null}
                  </TouchableOpacity>
                );
              })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export * from './types';

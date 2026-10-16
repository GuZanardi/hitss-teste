import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Users, ChevronRight, X } from "lucide-react-native";
import { TeamCardProps } from "./types";
import { teamColorClass } from "../../utils/teamColorClass";

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onPress,
  onEdit,
  onDelete,
}) => {
  const [actionsVisible, setActionsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={() => setActionsVisible(true)}
        delayLongPress={500}
        className="mb-3 flex-row items-center justify-between rounded-lg border border-border bg-surface px-4 py-[18px]"
      >
        <View className="mr-3 flex-1 flex-row items-center">
          <View className="mr-4">
            <Users color={team.colorHex || "#00B37E"} size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-white" numberOfLines={1}>
              {team.name}
            </Text>
            {team.description ? (
              <Text className="mt-0.5 text-xs text-textSecondary" numberOfLines={1}>
                {team.description}
              </Text>
            ) : null}
          </View>
        </View>

        <ChevronRight color="#7C7C8A" size={20} />
      </TouchableOpacity>

      <Modal
        visible={actionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 p-6">
          <View className="w-full max-w-[340px] rounded-xl border border-[#2E2E38] bg-surface p-5">
            <View className="mb-[18px] flex-row items-center justify-between">
              <Text className="mr-3 flex-1 text-base font-semibold text-white">{team.name}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar opções do time"
                onPress={() => setActionsVisible(false)}
              >
                <X color="#8D8D99" size={22} />
              </TouchableOpacity>
            </View>
            {onEdit ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setActionsVisible(false);
                  onEdit();
                }}
                className="mb-2.5 h-12 items-center justify-center rounded-lg bg-brand"
              >
                <Text className="text-[15px] font-semibold text-white">Editar</Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setActionsVisible(false);
                  onDelete();
                }}
                className="mb-2.5 h-12 items-center justify-center rounded-lg bg-red-600"
              >
                <Text className="text-[15px] font-semibold text-white">Excluir</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setActionsVisible(false)}
              className="items-center py-2.5"
            >
              <Text className="text-sm text-[#C4C4CC]">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export * from "./types";

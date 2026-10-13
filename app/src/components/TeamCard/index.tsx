import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Users, ChevronRight, X } from "lucide-react-native";
import { TeamCardProps } from "./types";

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
        style={styles.card}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Users color={team.colorHex || "#00B37E"} size={24} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {team.name}
            </Text>
            {team.description ? (
              <Text style={styles.description} numberOfLines={1}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{team.name}</Text>
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
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setActionsVisible(false);
                  onDelete();
                }}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setActionsVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#202024",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#29292E",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: "#8D8D99",
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#202024",
    borderRadius: 12,
    width: "100%",
    maxWidth: 340,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2E2E38",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  actionButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#00B37E",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#C4C4CC",
    fontSize: 14,
  },
});

export * from "./types";

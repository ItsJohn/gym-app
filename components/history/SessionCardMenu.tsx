import { Modal, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface SessionCardMenuProps {
  visible: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function SessionCardMenu({
  visible,
  onClose,
  onCopy,
  onDelete,
}: SessionCardMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <ThemedView style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onCopy}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.copyItemText}>
              📋 Copy Workout Details
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.deleteItemText}>
              🗑️ Delete Session
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  copyItemText: {
    fontSize: 16,
    color: "rgba(74, 144, 226, 1)",
    fontWeight: "500",
  },
  deleteItemText: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "500",
  },
});

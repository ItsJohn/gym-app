import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Exercise } from "@/validation/schemas";

import { ExerciseTypePicker } from "./ExerciseTypePicker";
import {
  changeExerciseType,
  getTargetFields,
  TARGET_FIELD_LABELS,
  TargetField,
} from "./exerciseTypes";

interface ExerciseEditModalProps {
  exercise: Exercise | null;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExerciseEditModal({
  exercise,
  onSave,
  onClose,
}: ExerciseEditModalProps) {
  const [draft, setDraft] = useState<Exercise | null>(exercise);
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => setDraft(exercise), [exercise]);

  if (!draft) return null;

  const fields = getTargetFields(draft.type);
  const canSave =
    !!draft.name.trim() && fields.every((f) => !!draft.target[f]?.trim());

  const updateTarget = (field: TargetField, value: string) =>
    setDraft({ ...draft, target: { ...draft.target, [field]: value } });
  const inputStyle = [styles.input, { color: textColor }];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <ThemedView style={styles.overlay}>
        <ThemedView style={[styles.container, { backgroundColor }]}>
          <ThemedText type="subtitle">Edit Exercise</ThemedText>

          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={inputStyle}
            value={draft.name}
            onChangeText={(name) => setDraft({ ...draft, name })}
          />

          <ThemedText style={styles.label}>Type</ThemedText>
          <ExerciseTypePicker
            value={draft.type}
            onChange={(type) => setDraft(changeExerciseType(draft, type))}
          />

          {fields.map((field) => (
            <ThemedView key={field}>
              <ThemedText style={styles.label}>
                {TARGET_FIELD_LABELS[field]}
              </ThemedText>
              <TextInput
                accessibilityLabel={TARGET_FIELD_LABELS[field]}
                style={inputStyle}
                value={draft.target[field] ?? ""}
                onChangeText={(value) => updateTarget(field, value)}
                keyboardType={field === "reps" ? "default" : "numeric"}
              />
            </ThemedView>
          ))}

          <ThemedView style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                !canSave && styles.disabled,
              ]}
              disabled={!canSave}
              onPress={() => onSave({ ...draft, name: draft.name.trim() })}
            >
              <ThemedText style={styles.saveText}>Save</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    color: "rgba(74, 144, 226, 1)",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  saveButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

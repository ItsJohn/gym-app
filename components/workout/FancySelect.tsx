import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useScrollTimeout } from "@/hooks";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useCallback, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface FancySelectProps {
  label: string;
  value: string | number;
  options: Array<{ label: string; value: string | number }>;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  suffix?: string;
}

export default function FancySelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Select...",
  suffix = "",
}: FancySelectProps) {
  const textColor = useThemeColor(
    { light: "#4A90E2", dark: "#000000" },
    "text",
  );

  const [isOpen, setIsOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption
    ? `${selectedOption.label}${suffix}`
    : placeholder;

  const handleSelect = useCallback(
    (selectedValue: string | number) => {
      onValueChange(selectedValue);
      setIsOpen(false);
    },
    [onValueChange],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Scroll to selected option when modal opens using specialized scroll timeout hook
  const scrollToSelectedOption = useCallback(() => {
    if (scrollViewRef.current) {
      const selectedIndex = options.findIndex(
        (option) => option.value === value,
      );
      if (selectedIndex !== -1) {
        // Calculate the scroll position (option height + border)
        const optionHeight = 49; // 16px padding top + 16px padding bottom + 1px border = 49px
        const scrollPosition = selectedIndex * optionHeight;

        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }
    }
  }, [options, value]);

  useScrollTimeout(scrollToSelectedOption, 100, isOpen && !!selectedOption);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[
            styles.selectText,
            !selectedOption && styles.placeholderText,
            { color: textColor },
          ]}
        >
          {displayValue}
        </ThemedText>
        <ThemedText style={styles.arrow}>▼</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <ThemedView style={styles.dropdown}>
            <ThemedView style={styles.dropdownHeader}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>
                {label}
              </ThemedText>
              <TouchableOpacity onPress={handleClose}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ScrollView
              ref={scrollViewRef}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  style={[
                    styles.option,
                    option.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      option.value === value && styles.selectedOptionText,
                      { color: textColor },
                    ]}
                  >
                    {option.label}
                    {suffix}
                  </ThemedText>
                  {option.value === value && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  placeholderText: {
    opacity: 0.5,
  },
  arrow: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: "70%",
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 18,
    opacity: 0.6,
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  selectedOption: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
  },
});

import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LOGIN_LABEL } from "../label";
import { UsernameModalProps } from "./types";

export const UsernameModal = ({
  visible,
  onSubmit,
  isLoading = false,
  errorMessage = "",
}: UsernameModalProps) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const [username, setUsername] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setLocalError(LOGIN_LABEL.ERROR_MESSAGE.ENTER_USERNAME);
      return;
    }

    if (trimmedUsername.length < 3) {
      setLocalError(LOGIN_LABEL.ERROR_MESSAGE.USERNAME_VALIDATION.MIN_LENGTH);
      return;
    }

    if (trimmedUsername.length > 20) {
      setLocalError(LOGIN_LABEL.ERROR_MESSAGE.USERNAME_VALIDATION.MAX_LENGTH);
      return;
    }

    // Allow only alphanumeric and underscore
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setLocalError(
        LOGIN_LABEL.ERROR_MESSAGE.USERNAME_VALIDATION.ALLOWED_CHARACTERS,
      );
      return;
    }

    setLocalError("");
    onSubmit(trimmedUsername);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: palette.modalOverlay },
          ]}
        >
          <View
            style={[styles.modalContent, { backgroundColor: palette.card }]}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="account-plus"
                size={24}
                color="white"
              />
            </View>

            <ThemedText style={[styles.modalTitle, { color: palette.icon }]}>
              {LOGIN_LABEL.CREATE_USERNAME}
            </ThemedText>
            <ThemedText
              style={[styles.modalMessage, { color: palette.mutedText }]}
            >
              {LOGIN_LABEL.PLEASE_ENTER_USERNAME}
            </ThemedText>

            <View style={{ width: "100%", marginTop: 20 }}>
              <ThemedText style={[styles.label, { color: palette.text }]}>
                {LOGIN_LABEL.CREATE_USERNAME}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.card,
                    color: palette.text,
                  },
                  localError || errorMessage ? styles.inputError : null,
                ]}
                placeholder={LOGIN_LABEL.ENTER_USERNAME_PLACEHOLDER}
                placeholderTextColor={palette.mutedText}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (localError) setLocalError("");
                }}
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              {(localError || errorMessage) && (
                <ThemedText style={styles.errorText}>
                  {localError || errorMessage}
                </ThemedText>
              )}

              <View style={{ marginTop: 16 }}>
                <OutlinedButton
                  title="Create Username"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "80%",
    maxWidth: 350,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#43A047",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "FrankRuhlLibre_500Medium",
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "FrankRuhlLibre_500Medium",
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginTop: 4,
  },
});

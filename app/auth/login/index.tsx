import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { labels } from "@/constants/label";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpMethod, setOtpMethod] = useState<"whatsapp" | "sms">("sms");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleGenerateOTP = () => {
    if (phoneNumber.trim()) {
      setErrorMessage("");
      setShowSuccessModal(true);
      // Add your OTP generation logic here
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } else {
      setErrorMessage("Please enter a phone number");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View>
        <ThemedText style={styles.title} type="title">
          {labels.LOGIN.TITLE}
        </ThemedText>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder={labels.LOGIN.PHONE_NUMBER_LABEL}
          placeholderTextColor="#81C784"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            if (errorMessage) setErrorMessage("");
          }}
          keyboardType="phone-pad"
          maxLength={10}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {errorMessage ? (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        ) : null}

        <View style={styles.otpMethodContainer}>
          <ThemedText style={styles.label} type="default">
            {labels.LOGIN.RECEIVE_OTP_VIA_LABEL}
          </ThemedText>

          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setOtpMethod("sms")}
            >
              <View style={styles.radioCircle}>
                {otpMethod === "sms" && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <ThemedText style={styles.radioLabel}>
                {labels.LOGIN.SMS_OPTION}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setOtpMethod("whatsapp")}
            >
              <View style={styles.radioCircle}>
                {otpMethod === "whatsapp" && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <ThemedText style={styles.radioLabel}>
                {labels.LOGIN.WHATSAPP_OPTION}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <OutlinedButton title="Generate OTP" onPress={handleGenerateOTP} />
        </View>
      </View>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          transparent={true}
          visible={showSuccessModal}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.checkmarkCircle}>
                <MaterialCommunityIcons
                  name="check-bold"
                  size={24}
                  color="white"
                />
              </View>
              <ThemedText style={styles.modalTitle}>Success!</ThemedText>
              <ThemedText style={styles.modalMessage}>
                OTP will be sent to {phoneNumber} via{" "}
                {otpMethod === "whatsapp" ? "WhatsApp" : "SMS"}
              </ThemedText>
            </View>
          </View>
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 20,
  },
  title: {
    fontSize: 48,
    lineHeight: 56,
    marginBottom: 4,
    paddingVertical: 4,
    color: "#2E7D32",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "500",
    color: "#1B5E20",
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: "#66BB6A",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    color: "#1B5E20",
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginBottom: 12,
    marginTop: -4,
  },
  otpMethodContainer: {
    marginBottom: 20,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#66BB6A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioCircleSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#43A047",
  },
  radioLabel: {
    fontSize: 16,
    color: "#2E7D32",
  },
  buttonContainer: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
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
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#43A047",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 50,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#388E3C",
    textAlign: "center",
    lineHeight: 24,
  },
});

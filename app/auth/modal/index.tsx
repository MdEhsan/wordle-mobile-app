import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { LOGIN_LABEL } from "../label";
import { LocalModalPropsType } from "./types";

export const LocalModal = ({
  showSuccessModal,
  setShowSuccessModal,
  phoneNumber,
  otpMethod,
  otpSent,
  otp,
  setOtp,
  errorMessage,
  setErrorMessage,
  handleVerifyOtp,
  handleResendOtp,
  verifyOtpFailed = false,
  isVerifying = false,
  isResending = false,
}: LocalModalPropsType) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (otpSent) {
      setCountdown(30);
      setCanResend(false);
    }
  }, [otpSent]);

  useEffect(() => {
    if (countdown > 0 && otpSent) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, otpSent]);

  const otpDigits = otp.padEnd(6, " ").split("").slice(0, 6);

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "");
    const newOtpArray = [...otpDigits];
    newOtpArray[index] = digit || " ";
    const newOtp = newOtpArray.join("").trim();
    setOtp(newOtp);

    if (errorMessage) setErrorMessage("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      !otpDigits[index].trim() &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={showSuccessModal}
      animationType="fade"
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <Pressable
        style={[styles.modalOverlay, { backgroundColor: palette.modalOverlay }]}
        onPress={Keyboard.dismiss}
      >
        <Pressable
          style={[styles.modalContent, { backgroundColor: palette.card }]}
          onPress={() => {}}
        >
          <View style={styles.checkmarkCircle}>
            <MaterialCommunityIcons name="check-bold" size={24} color="white" />
          </View>
          <ThemedText style={[styles.modalTitle, { color: palette.icon }]}>
            Success!
          </ThemedText>
          <ThemedText
            style={[styles.modalMessage, { color: palette.mutedText }]}
          >
            OTP will be sent to +91{phoneNumber} via{" "}
            {otpMethod === "whatsapp" ? "WhatsApp" : "SMS"}
          </ThemedText>

          {/* OTP input and verify button */}
          {true ? (
            <View style={{ width: "100%", marginTop: 16 }}>
              <View style={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.card,
                        color: palette.text,
                      },
                    ]}
                    placeholderTextColor={palette.mutedText}
                    value={otpDigits[index].trim()}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
              <OutlinedButton
                title="Verify OTP"
                onPress={handleVerifyOtp}
                borderColor={verifyOtpFailed ? "#F44336" : undefined}
                isLoading={isVerifying || isResending}
              />

              {/* Resend OTP Button */}
              <Pressable
                style={styles.resendContainer}
                onPress={() => {
                  if (canResend && !isResending) {
                    handleResendOtp();
                    setCountdown(30);
                    setCanResend(false);
                  }
                }}
                disabled={!canResend || isResending}
              >
                <ThemedText
                  style={[
                    styles.resendText,
                    { color: palette.icon },
                    (!canResend || isResending) && styles.resendTextDisabled,
                  ]}
                >
                  {isResending
                    ? LOGIN_LABEL.RESEND_OTP.RESENDING_LABEL
                    : canResend
                      ? LOGIN_LABEL.RESEND_OTP.LABEL
                      : `${LOGIN_LABEL.RESEND_OTP.TIMER_LABEL} ${countdown}s`}
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 6,
  },
  otpInput: {
    width: "14%",
    minWidth: 34,
    maxWidth: 45,
    height: 56,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 24,
    fontFamily: "FrankRuhlLibre_500Medium",
    textAlign: "center",
  },
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
  checkmarkCircle: {
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
  resendContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    fontFamily: "FrankRuhlLibre_500Medium",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "#9E9E9E",
  },
});

import useAuth from "@/auth-protect/useAuth";
import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/Color";
import { labels } from "@/constants/label";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ENDPOINTS } from "@/service/endpoints";
import { usePost } from "@/service/hooks/useMutation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LOGIN_LABEL } from "../label";
import { LocalModal } from "../modal";

export default function LoginPage() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpMethod, setOtpMethod] = useState<"whatsapp" | "sms">("sms");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyOtpFailed, setVerifyOtpFailed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumberFromApi, setMobileNumberFromApi] = useState("");
  const auth = useAuth();
  const router = useRouter();

  const { mutate: sendOtp, loading: sendingOtp } = usePost(
    ENDPOINTS.AUTH.SEND_OTP,
    {
      onSuccess: (data) => {
        if (data?.mobile) {
          setMobileNumberFromApi(data?.messageResult?.data?.to);
        }
        setOtpSent(true);
        setShowSuccessModal(true);
      },
      onError: (error) => {
        setErrorMessage(
          error.message || LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_SEND,
        );
      },
    },
  );

  const { mutate: loginWithOtp, loading: verifyingOtp } = usePost(
    ENDPOINTS.AUTH.LOGIN,
    {
      onSuccess: async (data) => {
        setVerifyOtpFailed(false);
        if (!data?.token) {
          setErrorMessage(LOGIN_LABEL.INVALID_RESPONSE);
          return;
        }

        try {
          const userData = data.user || { phone: phoneNumber };
          await auth.login(data.token, userData);
          setShowSuccessModal(false);
          router.replace("/play");
        } catch (_error) {
          setErrorMessage(LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_SAVE_LOGIN);
        }
      },
      onError: (_error) => {
        setVerifyOtpFailed(true);
        setErrorMessage(LOGIN_LABEL.API_ERROR_MESSAGE.INVALID_OTP);
      },
    },
  );

  const { mutate: resendOtp, loading: resendingOtp } = usePost(
    ENDPOINTS.AUTH.REGENERATE_OTP,
    {
      onSuccess: (data) => {
        if (data?.mobile) {
          setMobileNumberFromApi(data.mobile);
        }
      },
      onError: (error) => {
        setErrorMessage(
          error.message || LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_RESEND,
        );
      },
    },
  );

  const handleGenerateOTP = async () => {
    if (phoneNumber.trim()) {
      setErrorMessage("");
      await sendOtp({
        mobile: `+91${phoneNumber.trim()}`,
        useWhatsApp: otpMethod === "whatsapp",
      });
    } else {
      setErrorMessage(LOGIN_LABEL.ERROR_MESSAGE.ENTER_PHONE_NUMBER);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyOtpFailed(false);

    if (!otp.trim()) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    if (otp.trim().length !== 6) {
      setErrorMessage(LOGIN_LABEL.ERROR_MESSAGE.VALID_OTP);
      return;
    }

    await loginWithOtp({
      mobile: `${mobileNumberFromApi}` || `+91${phoneNumber.trim()}`,
      otp: otp.trim(),
    });
  };

  const handleResendOtp = async () => {
    if (phoneNumber.trim()) {
      setErrorMessage("");
      setOtp("");

      await resendOtp({
        mobile: `${mobileNumberFromApi}` || `+91${phoneNumber.trim()}`,
        useWhatsApp: otpMethod === "whatsapp",
      });

      setVerifyOtpFailed(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: palette.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ThemedText
            style={[
              styles.title,
              { fontFamily: "FrankRuhlLibre_700Bold", color: palette.icon },
            ]}
            type="title"
          >
            {labels.LOGIN.TITLE}
          </ThemedText>
        </View>

        <View style={[styles.formContainer, { backgroundColor: palette.card }]}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: palette.border,
                backgroundColor: palette.card,
                color: palette.text,
              },
              errorMessage ? styles.inputError : null,
            ]}
            placeholder={labels.LOGIN.PHONE_NUMBER_LABEL}
            placeholderTextColor={palette.mutedText}
            value={phoneNumber}
            onChangeText={(text) => {
              const num = isNaN(Number(text));
              if (!num) setPhoneNumber(text);
              if (errorMessage) setErrorMessage("");
            }}
            keyboardType="phone-pad"
          />

          {errorMessage ? (
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          ) : null}

          <View style={styles.otpMethodContainer}>
            <ThemedText
              style={[
                styles.label,
                { color: palette.text, fontFamily: "FrankRuhlLibre_500Medium" },
              ]}
              type="default"
            >
              {labels.LOGIN.RECEIVE_OTP_VIA_LABEL}
            </ThemedText>

            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setOtpMethod("sms")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.card,
                    },
                  ]}
                >
                  {otpMethod === "sms" && (
                    <View
                      style={[
                        styles.radioCircleSelected,
                        { backgroundColor: palette.green },
                      ]}
                    />
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.radioLabel,
                    {
                      color: palette.icon,
                      fontFamily: "FrankRuhlLibre_500Medium",
                    },
                  ]}
                >
                  {labels.LOGIN.SMS_OPTION}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setOtpMethod("whatsapp")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.card,
                    },
                  ]}
                >
                  {otpMethod === "whatsapp" && (
                    <View
                      style={[
                        styles.radioCircleSelected,
                        { backgroundColor: palette.green },
                      ]}
                    />
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.radioLabel,
                    {
                      color: palette.icon,
                      fontFamily: "FrankRuhlLibre_500Medium",
                    },
                  ]}
                >
                  {labels.LOGIN.WHATSAPP_OPTION}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <OutlinedButton
              title={LOGIN_LABEL.BUTTON_LABEL.GENERATE_OTP}
              onPress={handleGenerateOTP}
              isLoading={sendingOtp}
            />
          </View>
        </View>

        {showSuccessModal && (
          <LocalModal
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
            phoneNumber={phoneNumber}
            otpMethod={otpMethod}
            otpSent={otpSent}
            otp={otp}
            setOtp={(value) => {
              setOtp(value);
              if (verifyOtpFailed) {
                setVerifyOtpFailed(false);
              }
            }}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            handleVerifyOtp={handleVerifyOtp}
            handleResendOtp={handleResendOtp}
            verifyOtpFailed={verifyOtpFailed}
            isVerifying={verifyingOtp}
            isResending={resendingOtp}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 48,
    lineHeight: 60,
    marginBottom: 4,
    paddingVertical: 4,
    color: "#2E7D32",
    textAlign: "center",
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
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "FrankRuhlLibre_500Medium",
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
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

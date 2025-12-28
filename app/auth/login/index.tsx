import useAuth from "@/auth-protect/useAuth";
import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { labels } from "@/constants/label";
import { ENDPOINTS } from "@/service/endpoints";
import { usePost } from "@/service/hooks/useMutation";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LOGIN_LABEL } from "../label";
import { LocalModal } from "../modal";
import { UsernameModal } from "../username-modal";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpMethod, setOtpMethod] = useState<"whatsapp" | "sms">("sms");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mobileNumberFromApi, setMobileNumberFromApi] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [pendingAuthData, setPendingAuthData] = useState<{
    token: string;
    user: any;
  } | null>(null);
  const auth = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      router.replace("/play");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  const { mutate: sendOtp, loading: sendingOtp } = usePost(
    ENDPOINTS.AUTH.SEND_OTP,
    {
      onSuccess: (data) => {
        if (data?.mobile) {
          setMobileNumberFromApi(data.mobile);
        }
        setOtpSent(true);
        setShowSuccessModal(true);
      },
      onError: (error) => {
        setErrorMessage(
          error.message || LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_SEND
        );
      },
    }
  );

  const { mutate: loginWithOtp, loading: verifyingOtp } = usePost(
    ENDPOINTS.AUTH.LOGIN,
    {
      onSuccess: async (data) => {
        if (data?.token) {
          // Check if username exists
          if (!data.user?.username) {
            // Show username modal
            setPendingAuthData({
              token: data.token,
              user: data.user || { phone: phoneNumber },
            });
            setShowSuccessModal(false);
            setShowUsernameModal(true);
          } else {
            // Username exists, proceed with login
            try {
              await auth.login(data.token, data.user || { phone: phoneNumber });
              router.replace("/play");
            } catch (error) {
              setErrorMessage(
                LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_SAVE_LOGIN
              );
            }
          }
        } else {
          setErrorMessage(LOGIN_LABEL.INVALID_RESPONSE);
        }
      },
      onError: (error) => {
        setErrorMessage(
          error.message || LOGIN_LABEL.API_ERROR_MESSAGE.INVALID_OTP
        );
      },
    }
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
          error.message || LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_RESEND
        );
      },
    }
  );

  const { mutate: createUsername, loading: creatingUsername } = usePost(
    ENDPOINTS.AUTH.CREATE_USERNAME,
    {
      onSuccess: async (data) => {
        // Now save the auth data and navigate
        if (pendingAuthData) {
          try {
            await auth.login(
              pendingAuthData.token,
              data.user || pendingAuthData.user
            );
            setShowUsernameModal(false);
            router.replace("/play");
          } catch (error) {
            setUsernameError(
              LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_SAVE_LOGIN
            );
          }
        }
      },
      onError: (error) => {
        setUsernameError(
          error.message ||
            LOGIN_LABEL.API_ERROR_MESSAGE.FAILED_TO_CREATE_USERNAME
        );
      },
    }
  );

  const handleGenerateOTP = async () => {
    if (phoneNumber.trim()) {
      setErrorMessage("");
      await sendOtp({
        mobile: `${phoneNumber.trim()}`,
        useWhatsApp: otpMethod === "whatsapp",
      });
    } else {
      setErrorMessage(LOGIN_LABEL.ERROR_MESSAGE.ENTER_PHONE_NUMBER);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    if (otp.trim().length !== 6) {
      setErrorMessage(LOGIN_LABEL.ERROR_MESSAGE.VALID_OTP);
      return;
    }

    await loginWithOtp({
      mobile: mobileNumberFromApi || `${phoneNumber.trim()}`,
      otp: otp.trim(),
    });
  };

  const handleResendOtp = async () => {
    if (phoneNumber.trim()) {
      setErrorMessage("");
      setOtp("");

      await resendOtp({
        mobile: mobileNumberFromApi || `${phoneNumber.trim()}`,
        useWhatsApp: otpMethod === "whatsapp",
      });
    }
  };

  const handleCreateUsername = async (username: string) => {
    setUsernameError("");
    await createUsername({ username });
  };

  return (
    <ThemedView style={styles.container}>
      <View>
        <ThemedText
          style={[styles.title, { fontFamily: "FrankRuhlLibre_700Bold" }]}
          type="title"
        >
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {errorMessage ? (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        ) : null}

        <View style={styles.otpMethodContainer}>
          <ThemedText
            style={[styles.label, { fontFamily: "FrankRuhlLibre_500Medium" }]}
            type="default"
          >
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
              <ThemedText
                style={[
                  styles.radioLabel,
                  { fontFamily: "FrankRuhlLibre_500Medium" },
                ]}
              >
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
              <ThemedText
                style={[
                  styles.radioLabel,
                  { fontFamily: "FrankRuhlLibre_500Medium" },
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
          setOtp={setOtp}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          handleVerifyOtp={handleVerifyOtp}
          handleResendOtp={handleResendOtp}
          isVerifying={verifyingOtp}
          isResending={resendingOtp}
        />
      )}

      <UsernameModal
        visible={showUsernameModal}
        onSubmit={handleCreateUsername}
        isLoading={creatingUsername}
        errorMessage={usernameError}
      />
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
});

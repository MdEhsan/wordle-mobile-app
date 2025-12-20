export type LocalModalPropsType = {
    showSuccessModal: boolean;
    setShowSuccessModal: (value: boolean) => void;
    phoneNumber: string;
    otpMethod: "whatsapp" | "sms";
    otpSent: boolean;
    otp: string;
    setOtp: (value: string) => void;
    errorMessage: string;
    setErrorMessage: (value: string) => void;
    handleVerifyOtp: () => void;
    handleResendOtp: () => void;
    isVerifying?: boolean;
    isResending?: boolean;
}
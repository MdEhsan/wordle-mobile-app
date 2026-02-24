import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

export const CustomModal = ({
  modalType,
  showModal,
  setShowModal,
  successMessage,
  word,
  handleSuccessContinue,
  texts,
  isAbandoningGame,
  handleConfirmExit,
}: {
  modalType: "success" | "opponentWin" | "exitConfirmation";
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  successMessage?: string;
  word?: string;
  handleSuccessContinue?: () => void;
  isAbandoningGame?: boolean;
  handleConfirmExit?: () => void;
  texts?: {
    congratulations?: string;
    awesome?: string;
    gameOver?: string;
    opponentWin?: string;
    leaveGame?: string;
    leaveConfirmation?: string;
    cancel?: string;
    confirm?: string;
  };
}) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const textColor = palette.text;

  const renderContent = (modalType: string) => {
    switch (modalType) {
      case "success":
        return (
          <>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={[styles.successTitle, { color: textColor }]}>
              {texts?.congratulations}
            </Text>
            <Text style={[styles.successMessage, { color: textColor }]}>
              {successMessage}
            </Text>
            <Text style={[styles.wordReveal, { color: palette.green }]}>
              {`The word was: ${word?.toUpperCase()}`}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: palette.green }]}
              onPress={handleSuccessContinue}
            >
              <Text style={styles.closeButtonText}>{texts?.awesome}</Text>
            </TouchableOpacity>
          </>
        );
      case "opponentWin":
        return (
          <>
            <Text style={[styles.opponentTitle, { color: textColor }]}>
              {texts?.gameOver}
            </Text>
            <Text style={[styles.opponentMessage, { color: textColor }]}>
              {texts?.opponentWin}
            </Text>
          </>
        );
      case "exitConfirmation":
        return (
          <>
            <Text style={[styles.exitConfirmTitle, { color: textColor }]}>
              {texts?.leaveGame}
            </Text>
            <Text style={[styles.exitConfirmMessage, { color: textColor }]}>
              {texts?.leaveConfirmation}
            </Text>
            <View style={styles.exitButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.exitButton,
                  styles.cancelButton,
                  { borderColor: palette.gray },
                ]}
                onPress={() => setShowModal(false)}
                disabled={isAbandoningGame}
              >
                <Text style={[styles.exitButtonText, { color: textColor }]}>
                  {texts?.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exitButton, { backgroundColor: palette.green }]}
                onPress={handleConfirmExit}
                disabled={isAbandoningGame}
              >
                <Text style={styles.confirmButtonText}>{texts?.confirm}</Text>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };
  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: palette.modalOverlay }]}
      >
        <Animated.View
          style={[
            styles.modalCard,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
          entering={ZoomIn.duration(300)}
        >
          {renderContent(modalType)}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  wordReveal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 24,
    letterSpacing: 2,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  opponentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  opponentMessage: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  exitConfirmTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  exitConfirmMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  exitButtonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  exitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 2,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const LETTERS = ["W", "O", "R", "D", "L", "E"];
const COLORS = [
  "#538d4e",
  "#b59f3b",
  "#538d4e",
  "#3a3a3c",
  "#b59f3b",
  "#538d4e",
];

const MATCH_STATUS_MESSAGES = [
  "Getting your match ready…",
  "Setting up the match…",
  "Match is starting, hang tight…",
  "Preparing your match…",
  "Loading match, almost there…",
];

const WordleLoader = ({
  visible = false,
  message,
  splash = false,
  hideMessage = false,
}: {
  visible?: boolean;
  message?: string;
  splash?: boolean;
  hideMessage?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  const statusMessages = useMemo(() => {
    if (!message) {
      return MATCH_STATUS_MESSAGES;
    }

    const trimmedMessage = String(message).trim();
    if (!trimmedMessage) {
      return MATCH_STATUS_MESSAGES;
    }

    return [
      trimmedMessage,
      ...MATCH_STATUS_MESSAGES.filter((item) => item !== trimmedMessage),
    ];
  }, [message]);

  const tileAnims = useRef(
    LETTERS.map(() => ({
      rotate: new Animated.Value(0),
      color: new Animated.Value(0),
    })),
  ).current;

  // Fade the modal in/out
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (!visible || hideMessage) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [visible, statusMessages.length, hideMessage]);

  // Tile flip loop
  useEffect(() => {
    if (!visible) return;

    const animations = tileAnims.map(({ rotate, color }, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          // Flip to 90° (disappear)
          Animated.timing(rotate, {
            toValue: 1,
            duration: 220,
            useNativeDriver: false,
          }),
          // Swap color at invisible midpoint
          Animated.timing(color, {
            toValue: 1,
            duration: 0,
            useNativeDriver: false,
          }),
          // Flip back to 0° (reappear with new color)
          Animated.timing(rotate, {
            toValue: 0,
            duration: 220,
            useNativeDriver: false,
          }),
          // Hold before next cycle
          Animated.delay(LETTERS.length * 180 + 500),
          // Reset color
          Animated.timing(color, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ),
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [visible, tileAnims]);

  const displayMessage =
    statusMessages[messageIndex] || MATCH_STATUS_MESSAGES[0];

  if (!visible) return null;

  const tiles = (
    <View style={styles.tilesRow}>
      {LETTERS.map((letter, i) => {
        const { rotate, color } = tileAnims[i];

        const rotateY = rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "90deg"],
        });

        const backgroundColor = color.interpolate({
          inputRange: [0, 1],
          outputRange: ["#3a3a3c", COLORS[i]],
        });

        const borderColor = color.interpolate({
          inputRange: [0, 1],
          outputRange: ["#565758", COLORS[i]],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.tile,
              { backgroundColor, borderColor, transform: [{ rotateY }] },
            ]}
          >
            <Text style={styles.letter}>{letter}</Text>
          </Animated.View>
        );
      })}
    </View>
  );

  if (splash) {
    return (
      <Animated.View
        style={[
          styles.splashContainer,
          { opacity: fadeAnim, backgroundColor: palette.gameBg },
        ]}
      >
        {tiles}
      </Animated.View>
    );
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim, backgroundColor: palette.modalOverlay },
        ]}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          {tiles}

          {hideMessage ? null : (
            <Text style={[styles.message, { color: palette.mutedText }]}>
              {displayMessage}
            </Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 18,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      },
      android: { elevation: 20 },
    }),
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 7,
    marginBottom: 20,
  },
  tilesRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 20,
  },
  tile: {
    width: 46,
    height: 46,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  message: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});

export default WordleLoader;

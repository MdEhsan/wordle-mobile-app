import React, { useEffect, useRef } from "react";
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

const WordleLoader = ({ visible = false, message = "Loading…" }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.card}>
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

          <Text style={styles.message}>{message}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1a1a1b",
    borderRadius: 18,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3c",
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
    color: "#818384",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

export default WordleLoader;

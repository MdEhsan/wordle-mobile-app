import useAuth from "@/auth-protect/useAuth";
import { Colors } from "@/constants/Color";
import { ENDPOINTS } from "@/service/endpoints";
import { usePost } from "@/service/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type UIMode = "SINGLE" | "MULTIPLAYER";

interface StartGameResponse {
  gameId: string;
  mode: UIMode;
}

export default function PlayPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].gameBg;
  const textColor = Colors[colorScheme ?? "light"].text;
  const auth = useAuth();
  const [mode, setMode] = useState<UIMode>("SINGLE");

  const { mutate: startGame, loading: isStarting } = usePost<
    StartGameResponse,
    { mode: UIMode }
  >(ENDPOINTS.GAME.START, {
    onSuccess: (data) => {
      router.push(`/game?gameId=${data?.data?.gameId}`);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to start game",
        text2: error.message || "Please try again.",
        position: "bottom",
        bottomOffset: 100,
      });
    },
  });

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
  };

  const handleStartGame = async () => {
    if (isStarting) {
      return;
    }
    await startGame({ mode });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={textColor} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Wordle</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Ready to test your word skills?
        </Text>

        <View style={styles.modeContainer}>
          <Text style={[styles.modeLabel, { color: textColor }]}>
            Choose mode
          </Text>
          <View style={styles.modeOptions}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "SINGLE" && styles.modeButtonActive,
              ]}
              onPress={() => setMode("SINGLE")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "SINGLE" && styles.modeButtonTextActive,
                ]}
              >
                Single
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "MULTIPLAYER" && styles.modeButtonActive,
              ]}
              onPress={() => setMode("MULTIPLAYER")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "MULTIPLAYER" && styles.modeButtonTextActive,
                ]}
              >
                Multiplayer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.playButton, isStarting && styles.playButtonDisabled]}
          onPress={handleStartGame}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="play" size={32} color="#fff" />
          )}
          <Text style={styles.playButtonText}>
            {isStarting ? "Starting..." : "Play Game"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: textColor }]}>
            Guess the word in 6 tries
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            Each guess must be a valid word
          </Text>
        </View>
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "FrankRuhlLibre_900Black",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 48,
    textAlign: "center",
    fontFamily: "FrankRuhlLibre_500Medium",
  },
  playButton: {
    backgroundColor: Colors.light.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonDisabled: {
    opacity: 0.7,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "FrankRuhlLibre_700Bold",
  },
  infoContainer: {
    marginTop: 48,
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    opacity: 0.7,
    fontFamily: "FrankRuhlLibre_500Medium",
  },
  modeContainer: {
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  modeLabel: {
    fontSize: 16,
    fontFamily: "FrankRuhlLibre_500Medium",
    opacity: 0.8,
  },
  modeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.green,
    backgroundColor: "transparent",
  },
  modeButtonActive: {
    backgroundColor: Colors.light.green,
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: "FrankRuhlLibre_700Bold",
    color: Colors.light.green,
  },
  modeButtonTextActive: {
    color: "#fff",
  },
});

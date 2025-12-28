import useAuth from "@/auth-protect/useAuth";
import { Colors } from "@/constants/Color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function PlayPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].gameBg;
  const textColor = Colors[colorScheme ?? "light"].text;
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
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

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push("/game")}
        >
          <Ionicons name="play" size={32} color="#fff" />
          <Text style={styles.playButtonText}>Play Game</Text>
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
});

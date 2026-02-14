import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/Color";
import { labels } from "@/constants/label";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function LandingPage() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <ThemedText
        style={{
          fontSize: 60,
          lineHeight: 40,
          paddingVertical: 5,
          color: palette.icon,
          fontFamily: "FrankRuhlLibre_700Bold",
        }}
        type="title"
      >
        {labels.TITLE}
      </ThemedText>
      <View style={styles.containerText}>
        <ThemedText
          style={{
            fontWeight: "normal",
            fontSize: 40,
            lineHeight: 40,
            color: palette.mutedText,
            fontFamily: "FrankRuhlLibre_700Bold",
          }}
          type="subtitle"
        >
          {labels.LOGIN_TITLE1}
        </ThemedText>
        <ThemedText
          style={{
            fontWeight: "normal",
            fontSize: 40,
            lineHeight: 40,
            color: palette.mutedText,
          }}
          type="subtitle"
        >
          {labels.LOGIN_TITLE2}
        </ThemedText>
      </View>
      <View style={{ marginTop: 20 }}>
        <Link href="/auth/login" asChild>
          <OutlinedButton title={labels.BUTTONS_LABEL.LOGIN} />
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerText: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

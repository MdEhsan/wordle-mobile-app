import OutlinedButton from "@/components/buttons/outlined";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { labels } from "@/constants/label";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function LandingPage() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText
        style={{
          fontSize: 60,
          lineHeight: 40,
          paddingVertical: 5,
          color: "#2E7D32",
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
            color: "#388E3C",
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
            color: "#388E3C",
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
    backgroundColor: "#E8F5E9",
  },
  containerText: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    color: "#2E7D32",
  },
});

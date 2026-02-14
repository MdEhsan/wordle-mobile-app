import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatsCardProps } from "./types";

export default function StatsCard({ label, value }: StatsCardProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: palette.mutedText }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 86,
  },
  label: {
    fontSize: 12,
    fontFamily: "FrankRuhlLibre_500Medium",
    marginBottom: 6,
    textAlign: "center",
  },
  value: {
    fontSize: 22,
    fontFamily: "FrankRuhlLibre_700Bold",
    textAlign: "center",
  },
});

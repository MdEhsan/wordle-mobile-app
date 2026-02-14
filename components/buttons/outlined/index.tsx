import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { OutlinedButtonProps } from "../types";

export default function OutlinedButton({
  title,
  onPress,
  isLoading = false,
  borderColor,
}: OutlinedButtonProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  return (
    <Pressable
      style={[styles.button, { borderColor: borderColor || palette.border }]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <ThemedText
          style={{
            color: palette.text,
            fontFamily: "FrankRuhlLibre_500Medium",
          }}
          type="defaultSemiBold"
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

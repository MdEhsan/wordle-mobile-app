import { ThemedText } from "@/components/themed-text";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { OutlinedButtonProps } from "../types";

export default function OutlinedButton({
  title,
  onPress,
  isLoading = false,
}: OutlinedButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator color="#1B5E20" />
      ) : (
        <ThemedText
          style={{ color: "#1B5E20", fontFamily: "FrankRuhlLibre_500Medium" }}
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
    borderColor: "#66BB6A",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

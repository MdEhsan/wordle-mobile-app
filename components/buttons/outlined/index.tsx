import { ThemedText } from "@/components/themed-text";
import { Pressable, StyleSheet } from "react-native";
import { OutlinedButtonProps } from "../types";

export default function OutlinedButton({ title, onPress }: OutlinedButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <ThemedText style={{color: "#1B5E20"}} type="defaultSemiBold">{title}</ThemedText>
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

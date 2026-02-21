import { useColorScheme } from "@/hooks/use-color-scheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Colors } from "../../constants/Color";

type OnScreenKeyboardProps = {
  onKeyPressed: (key: string) => void;
  greenLetters: string[];
  yellowLetters: string[];
  grayLetters: string[];
};

export const ENTER = "ENTER";
export const BACKSPACE = "BACKSPACE";

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  [ENTER, "z", "x", "c", "v", "b", "n", "m", BACKSPACE],
];

const OnScreenKeyboard = ({
  onKeyPressed,
  greenLetters,
  yellowLetters,
  grayLetters,
}: OnScreenKeyboardProps) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const { width, height } = useWindowDimensions();
  const isCompact = width < 380 || height < 760;
  const rowGap = isCompact ? 4 : 6;
  const keyGap = isCompact ? 3 : 4;
  const sidePadding = isCompact ? 12 : 16;
  const keyboardWidth = Math.min(520, width - sidePadding * 2);
  const specialRatio = isCompact ? 1.22 : 1.35;
  const keyHeight = isCompact ? 48 : 56;

  const isSpecialKey = (key: string) => key === ENTER || key === BACKSPACE;

  const isInLetters = (key: string) =>
    [...greenLetters, ...yellowLetters, ...grayLetters].includes(key);

  const getWidthsForRow = (row: string[]) => {
    if (Platform.OS === "web" && width > 768) {
      return {
        normalWidth: 58,
        specialWidth: 58 * specialRatio,
      };
    }

    const specialCount = row.filter((key) => isSpecialKey(key)).length;
    const normalCount = row.length - specialCount;
    const totalUnits = normalCount + specialCount * specialRatio;
    const availableWidth = keyboardWidth - keyGap * (row.length - 1);
    const normalWidth = Math.floor(availableWidth / totalUnits);

    return {
      normalWidth,
      specialWidth: Math.floor(normalWidth * specialRatio),
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: isCompact ? 5 : 60,
          gap: rowGap,
          width: keyboardWidth,
          maxWidth: "100%",
        },
      ]}
    >
      {keys.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, { gap: keyGap }]}>
          {row.map((key, keyIndex) => {
            const { normalWidth, specialWidth } = getWidthsForRow(row);

            return (
              <Pressable
                onPress={() => onKeyPressed(key)}
                key={`key-${key}`}
                style={({ pressed }) => [
                  styles.key,
                  {
                    width: normalWidth,
                    height: keyHeight,
                    backgroundColor: palette.keyDefault,
                  },
                  isSpecialKey(key) && { width: specialWidth },
                  pressed && { backgroundColor: "#868686" },
                  {
                    backgroundColor: greenLetters.includes(key)
                      ? palette.green
                      : yellowLetters.includes(key)
                        ? palette.yellow
                        : grayLetters.includes(key)
                          ? palette.gray
                          : palette.keyDefault,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.keyText,
                    { fontSize: isCompact ? 16 : 20 },
                    { color: palette.keyText },
                    key === "ENTER" && { fontSize: 12 },
                    isInLetters(key) && { color: "#fff" },
                  ]}
                >
                  {isSpecialKey(key) ? (
                    key === ENTER ? (
                      "ENTER"
                    ) : (
                      <Ionicons
                        name="backspace-outline"
                        size={isCompact ? 20 : 24}
                        color={palette.keyText}
                      />
                    )
                  ) : (
                    key.toUpperCase()
                  )}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};
export default OnScreenKeyboard;
const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  key: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  keyText: {
    fontWeight: "bold",
    fontSize: 20,
  },
});

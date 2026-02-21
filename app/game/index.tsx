import useAuth from "@/auth-protect/useAuth";
import OnScreenKeyboard, {
  BACKSPACE,
  ENTER,
} from "@/components/onScreenkeyboard";
import { Colors } from "@/constants/Color";
import { useAppTheme } from "@/hooks/app-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ENDPOINTS } from "@/service/endpoints";
import { useMutation } from "@/service/hooks/useMutation";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { ValidateWordRequest, ValidateWordResponse } from "./types";

const ROWS = 6;

const allWords = [
  "apple",
  "bread",
  "crane",
  "drape",
  "eagle",
  "flame",
  "grape",
];

const Page = () => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const backgroundColor = palette.gameBg;
  const textColor = palette.text;
  const grayColor = palette.gray;
  const { theme, toggleTheme } = useAppTheme();
  const { width, height } = useWindowDimensions();

  const [rows, setRows] = useState<string[][]>(
    new Array(ROWS).fill(new Array(5).fill("")),
  );
  const [curRow, setCurRow] = useState(0);
  const [curCol, _setCurCol] = useState(0);

  const [greenLetters, setGreenLetters] = useState<string[]>([]);
  const [yellowLetters, setYellowLetters] = useState<string[]>([]);
  const [grayLetters, setGrayLetters] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [word, setWord] = useState<string>("");

  const colStateRef = useRef(curCol);

  const router = useRouter();
  const auth = useAuth();
  const profileName = auth.user?.username || "Player";

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
  };

  // const {
  //   data: dailyWordData,
  //   loading: loadingWord,
  //   error: wordError,
  // } = useFetch<DailyWordResponse>(ENDPOINTS.WORDLE.GET_DAILY_WORD);

  const { mutate: validateWord, loading: validatingWord } = useMutation<
    ValidateWordResponse,
    ValidateWordRequest
  >("post", ENDPOINTS.WORDLE.VALIDATE_WORD);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  // useEffect(() => {
  //   if (dailyWordData?.success && dailyWordData?.data?.word) {
  //     setWord(dailyWordData?.data?.word.toLowerCase());
  //   }
  // }, [dailyWordData]);

  const wordLetters = word ? word.split("") : [];
  const isCompactHeight = height < 760;
  const tileGap = width < 360 ? 6 : 8;
  const boardMaxWidth = Math.min(width - 28, 380);
  const tileSize = Math.max(
    46,
    Math.min(62, (boardMaxWidth - tileGap * 4) / 5),
  );

  const setCurCol = (data: number) => {
    colStateRef.current = data;
    _setCurCol(data);
  };

  const addKey = (key: string) => {
    // if (!word || loadingWord) {
    //   return;
    // }

    const newRows = [...rows.map((row) => [...row])];

    if (key === "ENTER") {
      checkWord();
    } else if (key === "BACKSPACE") {
      if (colStateRef.current === 0) {
        newRows[curRow][0] = "";
        setRows(newRows);
        return;
      }

      newRows[curRow][colStateRef.current - 1] = "";

      setCurCol(colStateRef.current - 1);
      setRows(newRows);
      return;
    } else if (colStateRef.current >= newRows[curRow].length) {
    } else {
      newRows[curRow][colStateRef.current] = key;
      setRows(newRows);
      setCurCol(colStateRef.current + 1);
    }
  };

  const checkWord = async () => {
    const currentWord = rows[curRow].join("");

    if (!word || word.length === 0) {
      return;
    }

    if (currentWord.length < word.length) {
      shakeRow();
      return;
    }

    try {
      const validationResult = await validateWord({ word: currentWord });

      if (!validationResult?.isValid) {
        shakeRow();
        return;
      }
    } catch (error) {
      if (!allWords.includes(currentWord)) {
        shakeRow();
        return;
      }
    }

    flipRow();

    const newGreen: string[] = [];
    const newYellow: string[] = [];
    const newGray: string[] = [];

    currentWord.split("").forEach((letter, index) => {
      if (letter === wordLetters[index]) {
        newGreen.push(letter);
      } else if (wordLetters.includes(letter)) {
        newYellow.push(letter);
      } else {
        newGray.push(letter);
      }
    });

    setGreenLetters([...greenLetters, ...newGreen]);
    setYellowLetters([...yellowLetters, ...newYellow]);
    setGrayLetters([...grayLetters, ...newGray]);

    setTimeout(() => {
      if (currentWord === word) {
        const excitingMessages = [
          "🎉 Genius! You nailed it!",
          "🌟 Spectacular! You're a word wizard!",
          "🏆 Amazing! Perfect guess!",
          "💫 Brilliant! You've got the magic touch!",
          "🎊 Outstanding! You're on fire!",
          "✨ Phenomenal! You're a Wordle champion!",
        ];
        const randomMessage =
          excitingMessages[Math.floor(Math.random() * excitingMessages.length)];
        setSuccessMessage(randomMessage);
        setShowSuccessModal(true);
      } else if (curRow + 1 >= rows.length) {
        console.log("GAME OVER");
      }
    }, 1500);
    setCurRow(curRow + 1);
    setCurCol(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Enter") {
        addKey(ENTER);
      } else if (e.key === "Backspace") {
        addKey(BACKSPACE);
      } else if (e.key.length === 1) {
        addKey(e.key);
      }
    };

    if (Platform.OS === "web") {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (Platform.OS === "web") {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [curCol]);

  // const getCellColor = (cell: string, rowIndex: number, cellIndex: number) => {
  //   'worklet';
  //   if (curRow > rowIndex) {
  //     if (wordLetters[cellIndex] === cell) {
  //       return Colors.light.green;
  //     } else if (wordLetters.includes(cell)) {
  //       return Colors.light.yellow;
  //     } else {
  //       return grayColor;
  //     }
  //   }
  //   return 'transparent';
  // };

  // const getBorderColor = (cell: string, rowIndex: number, cellIndex: number) => {
  //   if (curRow > rowIndex && cell !== '') {
  //     return getCellColor(cell, rowIndex, cellIndex);
  //   }
  //   return Colors.light.gray;
  // };

  // Animations
  const setCellColor = (cell: string, rowIndex: number, cellIndex: number) => {
    if (curRow >= rowIndex && wordLetters.length > 0) {
      if (wordLetters[cellIndex] === cell) {
        cellBackgrounds[rowIndex][cellIndex].value = withDelay(
          cellIndex * 200,
          withTiming(palette.green),
        );
      } else if (wordLetters.includes(cell)) {
        cellBackgrounds[rowIndex][cellIndex].value = withDelay(
          cellIndex * 200,
          withTiming(palette.yellow),
        );
      } else {
        cellBackgrounds[rowIndex][cellIndex].value = withDelay(
          cellIndex * 200,
          withTiming(grayColor),
        );
      }
    } else {
      cellBackgrounds[rowIndex][cellIndex].value = withTiming("transparent", {
        duration: 100,
      });
    }
  };

  const setBorderColor = (
    cell: string,
    rowIndex: number,
    cellIndex: number,
  ) => {
    if (curRow > rowIndex && cell !== "" && wordLetters.length > 0) {
      if (wordLetters[cellIndex] === cell) {
        cellBorders[rowIndex][cellIndex].value = withDelay(
          cellIndex * 200,
          withTiming(palette.green),
        );
      } else if (wordLetters.includes(cell)) {
        cellBorders[rowIndex][cellIndex].value = withDelay(
          cellIndex * 200,
          withTiming(palette.yellow),
        );
      } else {
        cellBorders[rowIndex][cellIndex].value = withDelay(
          cellIndex * 200,
          withTiming(grayColor),
        );
      }
    }
    return palette.gray;
  };

  const offsetShakes = Array.from({ length: ROWS }, () => useSharedValue(0));

  const rowStyles = Array.from({ length: ROWS }, (_, index) =>
    useAnimatedStyle(() => {
      return {
        transform: [{ translateX: offsetShakes[index].value }],
      };
    }),
  );

  const tileRotates = Array.from({ length: ROWS }, () =>
    Array.from({ length: 5 }, () => useSharedValue(0)),
  );

  const cellBackgrounds = Array.from({ length: ROWS }, () =>
    Array.from({ length: 5 }, () => useSharedValue("transparent")),
  );

  const cellBorders = Array.from({ length: ROWS }, () =>
    Array.from({ length: 5 }, () => useSharedValue(palette.gray)),
  );

  const tileStyles = Array.from({ length: ROWS }, (_, index) => {
    return Array.from({ length: 5 }, (_, tileIndex) =>
      useAnimatedStyle(() => {
        return {
          transform: [{ rotateX: `${tileRotates[index][tileIndex].value}deg` }],
          borderColor: cellBorders[index][tileIndex].value,
          backgroundColor: cellBackgrounds[index][tileIndex].value,
        };
      }),
    );
  });

  const shakeRow = () => {
    const TIME = 80;
    const OFFSET = 10;

    offsetShakes[curRow].value = withSequence(
      withTiming(-OFFSET, { duration: TIME / 2 }),
      withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
      withTiming(0, { duration: TIME / 2 }),
    );
  };

  const flipRow = () => {
    const TIME = 300;
    const OFFSET = 90;

    tileRotates[curRow].forEach((value, index) => {
      value.value = withDelay(
        index * 100,
        withSequence(
          withTiming(OFFSET, { duration: TIME }, () => {}),
          withTiming(0, { duration: TIME }),
        ),
      );
    });
  };

  useEffect(() => {
    if (curRow === 0) return;

    rows[curRow - 1].map((cell, cellIndex) => {
      setCellColor(cell, curRow - 1, cellIndex);
      setBorderColor(cell, curRow - 1, cellIndex);
    });
  }, [curRow]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/play")}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color={textColor} />
      </TouchableOpacity>

      {showProfileMenu ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setShowProfileMenu(false)}
        />
      ) : null}

      <View style={styles.profileArea}>
        <Pressable
          style={styles.profileButton}
          onPress={() => setShowProfileMenu((prev) => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="person-circle-outline"
            size={30}
            color={palette.icon}
          />
        </Pressable>

        {showProfileMenu ? (
          <View
            style={[
              styles.profileMenu,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={[styles.menuItem, styles.menuItemStatic]}>
              <Ionicons name="person-outline" size={18} color={textColor} />
              <Text
                style={[styles.menuItemText, { color: textColor }]}
                numberOfLines={1}
              >
                {profileName}
              </Text>
            </View>

            <View
              style={[styles.menuDivider, { backgroundColor: palette.border }]}
            />

            <Pressable
              style={styles.menuItem}
              onPress={async () => {
                await toggleTheme();
                setShowProfileMenu(false);
              }}
            >
              <Ionicons
                name={theme === "light" ? "moon-outline" : "sunny-outline"}
                size={18}
                color={textColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                {theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={async () => {
                setShowProfileMenu(false);
                await handleLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Logout
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* {loadingWord && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={textColor} />
          <Text style={[styles.statusText, { color: textColor }]}>
            Loading today's word...
          </Text>
        </View>
      )} */}

      {/* Error State */}
      {/* {wordError && !loadingWord && (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="red" />
          <Text style={[styles.statusText, { color: textColor }]}>
            Failed to load today's word
          </Text>
          <Text style={[styles.errorText, { color: grayColor }]}>
            {wordError.message}
          </Text>
        </View>
      )} */}

      {/* Game Content */}
      {/* {!loadingWord && !wordError && word && ( */}
      <View
        style={[styles.gameContent, { paddingTop: isCompactHeight ? 44 : 56 }]}
      >
        <View
          style={[
            styles.gameField,
            { gap: tileGap, marginTop: isCompactHeight ? 6 : 50 },
          ]}
        >
          {rows.map((row, rowIndex) => (
            <Animated.View
              style={[
                styles.gameFieldRow,
                { gap: tileGap },
                rowStyles[rowIndex],
              ]}
              key={`row-${rowIndex}`}
            >
              {row.map((cell, cellIndex) => (
                <Animated.View
                  entering={ZoomIn.delay(50 * cellIndex)}
                  key={`cell-${rowIndex}-${cellIndex}`}
                >
                  <Animated.View
                    style={[
                      styles.cell,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.card,
                        width: tileSize,
                        height: tileSize,
                      },
                      // {
                      //   borderColor: getBorderColor(cell, rowIndex, cellIndex),
                      //   backgroundColor: getCellColor(cell, rowIndex, cellIndex),
                      // },
                      tileStyles[rowIndex][cellIndex],
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.cellText,
                        { fontSize: tileSize * 0.48 },
                        {
                          color: curRow > rowIndex ? "#fff" : textColor,
                        },
                      ]}
                    >
                      {cell}
                    </Animated.Text>
                  </Animated.View>
                </Animated.View>
              ))}
            </Animated.View>
          ))}
        </View>
        <OnScreenKeyboard
          onKeyPressed={addKey}
          greenLetters={greenLetters}
          yellowLetters={yellowLetters}
          grayLetters={grayLetters}
        />
      </View>
      {/* )} */}

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.modalContent, { backgroundColor: palette.card }]}
            entering={ZoomIn.duration(300)}
          >
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={[styles.successTitle, { color: textColor }]}>
              Congratulations!
            </Text>
            <Text style={[styles.successMessage, { color: textColor }]}>
              {successMessage}
            </Text>
            <Text style={[styles.wordReveal, { color: palette.green }]}>
              {`The word was: ${word.toUpperCase()}`}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: palette.green }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/play");
              }}
            >
              <Text style={styles.closeButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default Page;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: "hidden",
  },
  gameContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
  },
  profileArea: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
    alignItems: "flex-end",
  },
  profileButton: {
    padding: 8,
    zIndex: 102,
  },
  profileMenu: {
    position: "absolute",
    top: 46,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 220,
    paddingVertical: 8,
    ...StyleSheet.flatten(
      Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
        },
      }),
    ),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemStatic: {
    paddingRight: 18,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 12,
    opacity: 0.4,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: "FrankRuhlLibre_500Medium",
    flexShrink: 1,
  },
  gameField: {
    alignItems: "center",
  },
  gameFieldRow: {
    flexDirection: "row",
  },
  cell: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  cellText: {
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.dark.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  wordReveal: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    letterSpacing: 2,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

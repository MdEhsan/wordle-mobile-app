import useAuth from "@/auth-protect/useAuth";
import { CustomModal } from "@/components/modal";
import { ModalLabel } from "@/components/modal/label";
import OnScreenKeyboard, {
  BACKSPACE,
  ENTER,
} from "@/components/onScreenkeyboard";
import Profile from "@/components/profile";
import { Colors } from "@/constants/Color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ENDPOINTS } from "@/service/endpoints";
import { useMutation } from "@/service/hooks/useMutation";
import socketService from "@/service/socket.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
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

const Page = () => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const backgroundColor = palette.gameBg;
  const textColor = palette.text;
  const grayColor = palette.gray;
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
  const [showOpponentWinModal, setShowOpponentWinModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isAbandoningGame, setIsAbandoningGame] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [word, setWord] = useState<string>("");
  const [feedbackByRow, setFeedbackByRow] = useState<string[][]>(
    Array.from({ length: ROWS }, () => []),
  );

  const colStateRef = useRef(curCol);
  const isAbandoningGameRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const hasHandledOpponentWinRef = useRef(false);
  const winRedirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const opponentRedirectTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const socketUnsubscribeRef = useRef<(() => void) | null>(null);

  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const auth = useAuth();
  const profileName = auth.user?.username || "Player";

  const { mutate: validateWord, loading: validatingWord } = useMutation<
    ValidateWordResponse,
    ValidateWordRequest
  >("post", ENDPOINTS.GAME.SUBMIT_GUESS);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  const clearNavigationTimers = () => {
    if (winRedirectTimeoutRef.current) {
      clearTimeout(winRedirectTimeoutRef.current);
      winRedirectTimeoutRef.current = null;
    }

    if (opponentRedirectTimeoutRef.current) {
      clearTimeout(opponentRedirectTimeoutRef.current);
      opponentRedirectTimeoutRef.current = null;
    }
  };

  const navigateToPlayOnce = (options?: { disconnectSocket?: boolean }) => {
    if (hasNavigatedRef.current) {
      return;
    }

    clearNavigationTimers();
    hasNavigatedRef.current = true;

    if (options?.disconnectSocket) {
      socketService.disconnect();
    }

    router.push("/play");
  };

  const handleGameExit = () => {
    setShowExitConfirmation(true);
  };

  const handleConfirmExit = async () => {
    if (isAbandoningGameRef.current) {
      return;
    }

    isAbandoningGameRef.current = true;
    setIsAbandoningGame(true);
    setShowExitConfirmation(false);

    navigateToPlayOnce({ disconnectSocket: true });
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    navigateToPlayOnce();
  };

  const scheduleWinRedirect = () => {
    if (winRedirectTimeoutRef.current) {
      clearTimeout(winRedirectTimeoutRef.current);
    }

    winRedirectTimeoutRef.current = setTimeout(() => {
      setShowSuccessModal(false);
      navigateToPlayOnce();
    }, 2500);
  };

  const handleOpponentWin = () => {
    if (hasNavigatedRef.current || hasHandledOpponentWinRef.current) {
      return;
    }

    hasHandledOpponentWinRef.current = true;

    setShowOpponentWinModal(true);

    if (opponentRedirectTimeoutRef.current) {
      clearTimeout(opponentRedirectTimeoutRef.current);
    }

    opponentRedirectTimeoutRef.current = setTimeout(() => {
      setShowOpponentWinModal(false);
      if (socketUnsubscribeRef.current) {
        socketUnsubscribeRef.current();
        socketUnsubscribeRef.current = null;
      }
      navigateToPlayOnce({ disconnectSocket: true });
    }, 2500);
  };

  // Register BackHandler for Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!isAbandoningGameRef.current) {
          handleGameExit();
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      },
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    hasHandledOpponentWinRef.current = false;

    const unsubscribe = socketService.subscribe((payload) => {
      console.log("Received socket message:", payload);
      const message = (payload || {}) as {
        event?: string;
        type?: string;
        winnerUsername?: string;
        data?: { sessionId?: string; winnerUsername?: string };
        payload?: { winnerUsername?: string; sessionId?: string };
        sessionId?: string;
      };

      const eventType = String(
        message?.event || message?.type || "",
      ).toUpperCase();
      const winnerUsername =
        typeof message?.winnerUsername === "string"
          ? message.winnerUsername
          : typeof message?.data?.winnerUsername === "string"
            ? message.data.winnerUsername
            : typeof message?.payload?.winnerUsername === "string"
              ? message.payload.winnerUsername
              : undefined;
      const currentUsername = auth?.user?.username;

      if (!winnerUsername || !currentUsername) {
        return;
      }

      if (
        eventType &&
        eventType !== "PLAYER_COMPLETED" &&
        eventType !== "GAME_OVER" &&
        eventType !== "MATCH_RESULT"
      ) {
        return;
      }

      const normalizedWinner = String(winnerUsername).trim().toLowerCase();
      const normalizedCurrent = String(currentUsername).trim().toLowerCase();
      const isOpponentWin = normalizedWinner !== normalizedCurrent;
      if (!isOpponentWin) {
        return;
      }

      const incomingSessionId =
        message?.data?.sessionId ||
        message?.sessionId ||
        message?.payload?.sessionId ||
        null;
      const resolvedSessionId = Array.isArray(sessionId)
        ? sessionId[0]
        : sessionId;

      if (
        incomingSessionId &&
        resolvedSessionId &&
        String(incomingSessionId) !== String(resolvedSessionId)
      ) {
        return;
      }

      handleOpponentWin();
    });

    socketUnsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      socketUnsubscribeRef.current = null;
    };
  }, [sessionId, auth?.user?.username]);

  useEffect(() => {
    return () => {
      clearNavigationTimers();
    };
  }, []);

  const isCompactHeight = height < 760;
  const tileGap = width < 360 ? 6 : 8;
  const boardMaxWidth = Math.min(width - 28, 380);
  const tileSize = Math.max(
    46,
    Math.min(62, (boardMaxWidth - tileGap * 4) / 5),
  );

  const getFeedbackColor = (status?: string) => {
    const normalizedStatus = String(status || "").toLowerCase();
    if (normalizedStatus === "correct") {
      return palette.green;
    }
    if (normalizedStatus === "present") {
      return palette.yellow;
    }
    if (normalizedStatus === "absent") {
      return grayColor;
    }
    return null;
  };

  const setCurCol = (data: number) => {
    colStateRef.current = data;
    _setCurCol(data);
  };

  const addKey = (key: string) => {
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
    if (validatingWord) {
      return;
    }

    const currentWord = rows[curRow].join("");

    if (currentWord.length < 5) {
      shakeRow();
      return;
    }

    if (!sessionId) {
      shakeRow();
      return;
    }

    let validationResult: any = null;

    try {
      validationResult = await validateWord({
        sessionId: (sessionId as string) ?? "",
        guess: currentWord,
      });

      const isValidGuess =
        validationResult?.isValid ??
        validationResult?.data?.isValid ??
        validationResult?.data?.valid ??
        validationResult?.valid;

      if (isValidGuess === false) {
        shakeRow();
        return;
      }
    } catch (error) {
      shakeRow();
      return;
    }

    flipRow();

    const newGreen: string[] = [];
    const newYellow: string[] = [];
    const newGray: string[] = [];

    const letterStatuses =
      validationResult?.data?.letterStatuses ||
      validationResult?.data?.feedback ||
      validationResult?.feedback ||
      [];

    const normalizedFeedback =
      Array.isArray(letterStatuses) && letterStatuses.length === 5
        ? letterStatuses.map((status) => String(status || "").toLowerCase())
        : [];

    if (normalizedFeedback.length === 5) {
      setFeedbackByRow((prev) => {
        const next = [...prev];
        next[curRow] = normalizedFeedback;
        return next;
      });
    }

    if (normalizedFeedback.length === 5) {
      currentWord.split("").forEach((letter, index) => {
        const status = normalizedFeedback[index];
        if (status === "correct" || status === "green") {
          newGreen.push(letter);
        } else if (status === "present" || status === "yellow") {
          newYellow.push(letter);
        } else {
          newGray.push(letter);
        }
      });
    } else {
      currentWord.split("").forEach((letter) => {
        if (greenLetters.includes(letter)) {
          newGreen.push(letter);
        } else if (yellowLetters.includes(letter)) {
          newYellow.push(letter);
        } else {
          newGray.push(letter);
        }
      });
    }

    setGreenLetters([...greenLetters, ...newGreen]);
    setYellowLetters([...yellowLetters, ...newYellow]);
    setGrayLetters([...grayLetters, ...newGray]);

    const isAllCorrectFeedback =
      normalizedFeedback.length === 5 &&
      normalizedFeedback.every((status) => status === "correct");

    const isCorrectGuess =
      isAllCorrectFeedback ||
      validationResult?.data?.isWin === true ||
      validationResult?.data?.isGameOver === true ||
      validationResult?.data?.status === "won";

    const targetWordFromApi = validationResult?.data?.guess;

    const isGameOver =
      validationResult?.data?.gameOver === true ||
      validationResult?.gameOver === true ||
      validationResult?.data?.status === "lost" ||
      validationResult?.status === "lost";

    setTimeout(() => {
      if (isCorrectGuess) {
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
        if (targetWordFromApi) {
          setWord(String(targetWordFromApi));
        }
        setShowSuccessModal(true);
        scheduleWinRedirect();
      } else if (isGameOver || curRow + 1 >= rows.length) {
        if (targetWordFromApi) {
          setWord(String(targetWordFromApi));
        }
      }
    }, 1500);
    setCurRow((prev) => prev + 1);
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

  // Animations
  const setCellColor = (_cell: string, rowIndex: number, cellIndex: number) => {
    const status = feedbackByRow[rowIndex]?.[cellIndex];

    if (curRow >= rowIndex && status) {
      const color =
        status === "correct"
          ? palette.green
          : status === "present"
            ? palette.yellow
            : grayColor;

      cellBackgrounds[rowIndex][cellIndex].value = withDelay(
        cellIndex * 200,
        withTiming(color),
      );
    } else {
      cellBackgrounds[rowIndex][cellIndex].value = withTiming(palette.card, {
        duration: 100,
      });
    }
  };

  const setBorderColor = (
    _cell: string,
    rowIndex: number,
    cellIndex: number,
  ) => {
    const status = feedbackByRow[rowIndex]?.[cellIndex];
    if (curRow > rowIndex && status) {
      const color =
        status === "correct"
          ? palette.green
          : status === "present"
            ? palette.yellow
            : grayColor;

      cellBorders[rowIndex][cellIndex].value = withDelay(
        cellIndex * 200,
        withTiming(color),
      );
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
    Array.from({ length: 5 }, () => useSharedValue(palette.card)),
  );

  const cellBorders = Array.from({ length: ROWS }, () =>
    Array.from({ length: 5 }, () => useSharedValue(palette.gray)),
  );

  const tileStyles = Array.from({ length: ROWS }, (_, index) => {
    return Array.from({ length: 5 }, (_, tileIndex) =>
      useAnimatedStyle(() => {
        return {
          transform: [{ rotateX: `${tileRotates[index][tileIndex].value}deg` }],
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
  }, [curRow, feedbackByRow]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGameExit}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={isAbandoningGame}
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
          <Profile
            profileName={profileName}
            setShowProfileMenu={setShowProfileMenu}
          />
        ) : null}
      </View>

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
              {row.map((cell, cellIndex) =>
                (() => {
                  const status = feedbackByRow[rowIndex]?.[cellIndex];
                  const feedbackColor = getFeedbackColor(status);
                  return (
                    <Animated.View
                      entering={ZoomIn.delay(50 * cellIndex)}
                      key={`cell-${rowIndex}-${cellIndex}`}
                    >
                      <Animated.View
                        style={[
                          styles.cell,
                          {
                            borderColor: feedbackColor || palette.border,
                            width: tileSize,
                            height: tileSize,
                          },
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
                  );
                })(),
              )}
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

      <CustomModal
        modalType="success"
        showModal={showSuccessModal}
        setShowModal={setShowSuccessModal}
        successMessage={successMessage}
        word={word}
        handleSuccessContinue={handleSuccessContinue}
        texts={{
          congratulations: ModalLabel.successModal.congratulations,
          awesome: ModalLabel.successModal.awesome,
        }}
      />

      <CustomModal
        modalType="opponentWin"
        showModal={showOpponentWinModal}
        setShowModal={setShowOpponentWinModal}
        texts={{
          gameOver: ModalLabel.opponentWinModal.gameOver,
          opponentWin: "Opponent has won.",
        }}
      />

      <CustomModal
        modalType="exitConfirmation"
        showModal={showExitConfirmation}
        setShowModal={setShowExitConfirmation}
        handleConfirmExit={handleConfirmExit}
        texts={{
          leaveGame: ModalLabel.exitConfirmationModal.leaveGame,
          leaveConfirmation: ModalLabel.exitConfirmationModal.leaveConfirmation,
          cancel: ModalLabel.exitConfirmationModal.cancel,
          confirm: ModalLabel.exitConfirmationModal.confirm,
        }}
      />
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
  gameContent: {
    flex: 1,
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
});

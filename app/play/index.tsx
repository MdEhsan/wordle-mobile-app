import useAuth from "@/auth-protect/useAuth";
import { Colors } from "@/constants/Color";
import { useAppTheme } from "@/hooks/app-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ENDPOINTS } from "@/service/endpoints";
import { useFetch, usePost } from "@/service/hooks";
import socketService, { SocketConnectionState } from "@/service/socket.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { PLAY_LABELS } from "./label";
import StatsCard from "./stats-card";
import { GameStatsResponse, StartGameResponse, UIMode } from "./types";

export default function PlayPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const backgroundColor = palette.gameBg;
  const textColor = palette.text;
  const auth = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const [mode, setMode] = useState<UIMode>("SINGLE");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] =
    useState<SocketConnectionState>("idle");
  const sessionIdRef = useRef<string | null>(null);

  let mockData = {
    totalGames: 120,
    totalWins: 70,
    totalLosses: 50,
    winPercentage: 58.33,
    currentStreak: 4,
    bestStreak: 11,
    eloRating: 1620,
  };

  const { data: statsData, loading: statsLoading } =
    useFetch<GameStatsResponse>(ENDPOINTS.GAME.GET_STATS);

  const profileName =
    statsData?.data?.username || auth.user?.username || "Player";

  const stats = statsData?.data?.stats || mockData; // Use mock data if API data is not available
  const statsItems = [
    {
      label: PLAY_LABELS.STATS_CARD.TOTAL_GAMES,
      value: statsLoading ? "--" : (stats?.totalGames ?? "--"),
    },
    {
      label: PLAY_LABELS.STATS_CARD.TOTAL_WINS,
      value: statsLoading ? "--" : (stats?.totalWins ?? "--"),
    },
    {
      label: PLAY_LABELS.STATS_CARD.TOTAL_LOSSES,
      value: statsLoading ? "--" : (stats?.totalLosses ?? "--"),
    },
    {
      label: PLAY_LABELS.STATS_CARD.WIN_PERCENTAGE,
      value: statsLoading
        ? "--"
        : stats?.winPercentage !== undefined
          ? `${stats.winPercentage}%`
          : "--",
    },
    {
      label: PLAY_LABELS.STATS_CARD.CURRENT_STREAK,
      value: statsLoading ? "--" : (stats?.currentStreak ?? "--"),
    },
    {
      label: PLAY_LABELS.STATS_CARD.BEST_STREAK,
      value: statsLoading ? "--" : (stats?.bestStreak ?? "--"),
    },
  ];

  const { mutate: startGame, loading: isStarting } = usePost<
    StartGameResponse,
    { mode: UIMode }
  >(ENDPOINTS.GAME.START, {
    onSuccess: (data) => {
      router.push(`/game?gameId=${data?.data?.gameId}`);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to start game",
        text2: error.message || "Please try again.",
        position: "bottom",
        bottomOffset: 100,
      });
    },
  });

  const { mutate: findMatch, loading: isFindingMatch } = usePost(
    ENDPOINTS.MATCHMAKING.FIND_MATCH,
    {
      onSuccess: async (data) => {
        const sessionId = data?.data?.sessionId ?? "";
        if (sessionId) {
          router.push(`/game?sessionId=${sessionId}`);
          return;
        }
        const resolvedSessionId = data?.data?.sessionId || null;
        setSessionId(resolvedSessionId);

        try {
          socketService.connect({
            token: auth.token ?? "",
          });
        } catch (socketError: any) {
          Toast.show({
            type: "error",
            text1: "Socket connection failed",
            text2: socketError?.message || PLAY_LABELS.TRY_AGAIN,
            position: "bottom",
            bottomOffset: 100,
          });
        }

        const opponentType = data?.data?.opponentType;
        if (
          opponentType === "bot" &&
          resolvedSessionId &&
          mode.toLowerCase() === "multiplayer"
        ) {
          await assignBot({ sessionId: resolvedSessionId });
          return;
        }

        Toast.show({
          type: "success",
          text1: PLAY_LABELS.MATCHMAKING.MATCHMAKING_STARTED,
          text2: PLAY_LABELS.MATCHMAKING.SEARCHING_OPPONENT,
          position: "bottom",
          bottomOffset: 100,
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: PLAY_LABELS.MATCHMAKING.ERROR,
          text2: error.message || PLAY_LABELS.TRY_AGAIN,
          position: "bottom",
          bottomOffset: 100,
        });
      },
    },
  );

  const { mutate: assignBot, loading: isAssigningBot } = usePost(
    ENDPOINTS.MATCHMAKING.ASSIGN_BOT,
    {
      onSuccess: (data) => {
        // const gameId = data?.data?.gameId || data?.gameId;
        // if (gameId) {
        //   router.push(`/game?gameId=${gameId}`);
        //   return;
        // }
        console.log("Bot assigned, response:", data);

        Toast.show({
          type: "success",
          text1: PLAY_LABELS.ASSIGN_BOT.BOT_ASSIGNED,
          text2: PLAY_LABELS.ASSIGN_BOT.MATCH_READY,
          position: "bottom",
          bottomOffset: 100,
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: PLAY_LABELS.ASSIGN_BOT.ERROR,
          text2: error.message || PLAY_LABELS.TRY_AGAIN,
          position: "bottom",
          bottomOffset: 100,
        });
      },
    },
  );

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const unsubscribeStatus = socketService.subscribeStatus((status) => {
      setSocketStatus(status);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = socketService.subscribe((payload) => {
      const message = (payload || {}) as any;
      const eventType = String(
        message?.event || message?.type || message?.data?.event || "",
      ).toLowerCase();
      const gameId =
        message?.data?.gameId || message?.gameId || message?.data?.matchId;
      const incomingSessionId =
        message?.data?.sessionId || message?.sessionId || null;

      const isMatchReadyEvent =
        eventType.includes("match") ||
        eventType.includes("ready") ||
        eventType.includes("start") ||
        message?.data?.matchFound === true ||
        message?.matchFound === true;

      if (!isMatchReadyEvent || !gameId) {
        return;
      }

      const currentSessionId = sessionIdRef.current;
      if (
        currentSessionId &&
        incomingSessionId &&
        incomingSessionId !== currentSessionId
      ) {
        return;
      }

      router.push(`/game?gameId=${gameId}`);
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
  };

  const handleStartGame = async () => {
    if (isStarting || isFindingMatch || isAssigningBot) {
      return;
    }

    const resolvedUserId = String(
      auth.user?.id ||
        auth.user?._id ||
        auth.user?.userId ||
        auth.user?.phone ||
        auth.user?.username ||
        "",
    );

    await findMatch({
      userId: resolvedUserId,
      eloRating: Number(stats?.eloRating ?? 0),
      mode: mode.toLowerCase() === "single" ? "single_player" : "multiplayer",
      gameType: "wordle",
    });

    // await startGame({ mode });
  };

  const showWaitingForMatch =
    !!sessionId &&
    mode.toLowerCase() === "multiplayer" &&
    (isFindingMatch ||
      isAssigningBot ||
      socketStatus === "connecting" ||
      socketStatus === "connected" ||
      socketStatus === "reconnecting");

  const socketStatusLabelMap: Record<SocketConnectionState, string> = {
    idle: "Idle",
    connecting: "Connecting",
    connected: "Connected",
    reconnecting: "Reconnecting",
    disconnected: "Disconnected",
    error: "Connection error",
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

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
                  ? PLAY_LABELS.BUTTON_LABEL.DARK_MODE
                  : PLAY_LABELS.BUTTON_LABEL.LIGHT_MODE}
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
                {PLAY_LABELS.BUTTON_LABEL.LOGOUT}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: textColor }]}>
          {PLAY_LABELS.TTTLE}
        </Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          {PLAY_LABELS.GAME_INTRO}
        </Text>

        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            {statsItems.slice(0, 3).map((item) => (
              <StatsCard
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </View>
          <View style={styles.statsRow}>
            {statsItems.slice(3, 6).map((item) => (
              <StatsCard
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </View>
        </View>

        <View style={styles.modeContainer}>
          <Text style={[styles.modeLabel, { color: textColor }]}>
            {PLAY_LABELS.CHOOSE_MODE}
          </Text>
          <View style={styles.modeOptions}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { borderColor: palette.green },
                mode === "SINGLE" && [
                  styles.modeButtonActive,
                  { backgroundColor: palette.green },
                ],
              ]}
              onPress={() => setMode("SINGLE")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  { color: palette.green },
                  mode === "SINGLE" && styles.modeButtonTextActive,
                ]}
              >
                {PLAY_LABELS.MODE.SINGLE}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { borderColor: palette.green },
                mode === "MULTIPLAYER" && [
                  styles.modeButtonActive,
                  { backgroundColor: palette.green },
                ],
              ]}
              onPress={() => setMode("MULTIPLAYER")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  { color: palette.green },
                  mode === "MULTIPLAYER" && styles.modeButtonTextActive,
                ]}
              >
                {PLAY_LABELS.MODE.MULTIPLAYER}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: palette.green },
            (isStarting || isFindingMatch || isAssigningBot) &&
              styles.playButtonDisabled,
          ]}
          onPress={handleStartGame}
          disabled={isStarting || isFindingMatch || isAssigningBot}
        >
          {isStarting || isFindingMatch || isAssigningBot ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="play" size={32} color="#fff" />
          )}
          <Text style={styles.playButtonText}>
            {isStarting
              ? PLAY_LABELS.STARTING
              : isAssigningBot
                ? PLAY_LABELS.ASSIGN_BOT.ASSIGNING_BOT
                : isFindingMatch
                  ? PLAY_LABELS.MATCHMAKING.FINDING_MATCH
                  : PLAY_LABELS.PLAY_GAME}
          </Text>
        </TouchableOpacity>

        {showWaitingForMatch ? (
          <View style={styles.waitingContainer}>
            <ActivityIndicator color={palette.green} size="small" />
            <Text style={[styles.waitingTitle, { color: textColor }]}>
              Waiting for opponent...
            </Text>
            <Text style={[styles.waitingSubText, { color: textColor }]}>
              Socket: {socketStatusLabelMap[socketStatus]}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: textColor }]}>
            {PLAY_LABELS.GAME_RULE.RULE1}
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            {PLAY_LABELS.GAME_RULE.RULE2}
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 80,
    paddingBottom: 24,
  },
  statsSection: {
    width: "100%",
    maxWidth: 560,
    gap: 10,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
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
  playButtonDisabled: {
    opacity: 0.7,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "FrankRuhlLibre_700Bold",
  },
  waitingContainer: {
    marginTop: 16,
    alignItems: "center",
    gap: 4,
  },
  waitingTitle: {
    fontSize: 15,
    fontFamily: "FrankRuhlLibre_700Bold",
  },
  waitingSubText: {
    fontSize: 13,
    opacity: 0.8,
    fontFamily: "FrankRuhlLibre_500Medium",
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
  modeContainer: {
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  modeLabel: {
    fontSize: 16,
    fontFamily: "FrankRuhlLibre_500Medium",
    opacity: 0.8,
  },
  modeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  modeButtonActive: {
    borderColor: "transparent",
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: "FrankRuhlLibre_700Bold",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
});

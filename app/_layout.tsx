import { AuthProvider } from "@/auth-protect/AuthProvider";
import useAuth from "@/auth-protect/useAuth";
import { AppThemeProvider } from "@/hooks/app-theme";
import {
  FrankRuhlLibre_500Medium,
  FrankRuhlLibre_700Bold,
  FrankRuhlLibre_900Black,
  useFonts,
} from "@expo-google-fonts/frank-ruhl-libre";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

export const RootLayout = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    FrankRuhlLibre_700Bold,
    FrankRuhlLibre_500Medium,
    FrankRuhlLibre_900Black,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          {/* AuthGate runs inside AuthProvider so it can read auth state and redirect */}
          <AuthGate />
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="play"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="game"
              options={{
                headerBackTitle: "Wordle",
                // headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
                headerBackTitleStyle: {
                  fontFamily: "FrankRuhlLibre_800ExtraBold",
                  fontSize: 26,
                },
                title: "",
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                presentation: "modal",
                headerShadowVisible: false,
                headerBackTitle: "",
                headerTitle: "Login",
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={26} color="#2E7D32" />
                  </TouchableOpacity>
                ),
              }}
            />
          </Stack>
          <Toast />
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
};

const AuthGate: React.FC = () => {
  const auth = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const onAuth = auth.isAuthenticated;

    const onAuthRoutes = segments.length > 0 && segments[0] === "auth";

    if (!onAuth && !onAuthRoutes) {
      // Not authenticated and not on an auth page -> send to login
      router.replace("/auth/login");
    }

    if (onAuth && onAuthRoutes) {
      // Authenticated but on auth routes -> send to play page
      router.replace("/play");
    }
  }, [auth.isAuthenticated, segments.join("/")]);

  return null;
};

export default RootLayout;

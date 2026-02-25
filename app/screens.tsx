import useAuth from "@/auth-protect/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { UsernameModal } from "./auth/username-modal";

export const Screens = () => {
  const auth = useAuth();
  const router = useRouter();
  return (
    <>
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
      {auth.isAuthenticated && !auth.user?.username && <UsernameModal />}
    </>
  );
};

const AuthGate: React.FC = () => {
  const auth = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    const onAuth = auth.isAuthenticated;

    const onAuthRoutes = segments.length > 0 && segments[0] === "auth";
    const onIndexRoute = pathname === "/" || pathname === "/index";

    if (!onAuth && !onAuthRoutes && !onIndexRoute) {
      // Not authenticated and not on an auth page -> send to login
      router.replace("/auth/login");
    }

    if (onAuth && onAuthRoutes) {
      // Authenticated but on auth routes -> send to play page
      router.replace("/play");
    }
  }, [auth.isAuthenticated, auth.isLoading, pathname, segments.join("/")]);

  return null;
};

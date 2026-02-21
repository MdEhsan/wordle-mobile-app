import { AuthProvider } from "@/auth-protect/AuthProvider";
import { AppThemeProvider } from "@/hooks/app-theme";
import {
  FrankRuhlLibre_500Medium,
  FrankRuhlLibre_700Bold,
  FrankRuhlLibre_900Black,
  useFonts,
} from "@expo-google-fonts/frank-ruhl-libre";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Screens } from "./screens";

SplashScreen.preventAutoHideAsync();

export const RootLayout = () => {
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
          <Screens />
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;

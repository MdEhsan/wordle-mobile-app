import { useAppTheme } from "@/hooks/app-theme";

export function useColorScheme() {
  const { theme } = useAppTheme();
  return theme;
}

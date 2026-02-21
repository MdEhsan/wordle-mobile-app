import useAuth from "@/auth-protect/useAuth";
import { Colors } from "@/constants/Color";
import { useAppTheme } from "@/hooks/app-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const Profile = ({
  profileName,
  setShowProfileMenu,
}: {
  profileName: string;
  setShowProfileMenu: (show: boolean) => void;
}) => {
  const { theme, toggleTheme } = useAppTheme();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const textColor = palette.text;
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
  };

  return (
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

      <View style={[styles.menuDivider, { backgroundColor: palette.border }]} />

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
          {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
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
        <Text style={[styles.menuItemText, { color: textColor }]}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: "hidden",
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
});

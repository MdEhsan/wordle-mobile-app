import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@user_data";

type User = {
  phone: string;
  id?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string, userData?: User) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load token and user on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    debugger;
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authToken: string, userData?: User) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);

      if (userData) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to save auth:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        token,
        login,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

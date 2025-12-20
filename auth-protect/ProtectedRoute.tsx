import React from 'react';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import useAuth from './useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // replace so user cannot go back to protected page with back button
      // login route lives at /auth/login
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' }}>
        <ActivityIndicator size="large" color="#43A047" />
      </View>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

export default ProtectedRoute;

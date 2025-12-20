import React, { useEffect } from "react";
import LandingPage from "./page/landing-page";
import useAuth from '@/auth-protect/useAuth';
import { useRouter } from 'expo-router';

export default function Index() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace('/auth/login');
    } else {
      // If authenticated, send to game by default
      router.replace('/game');
    }
  }, [auth.isAuthenticated]);

  // don't render the landing page while redirecting
  if (!auth.isAuthenticated) return null;

  return <LandingPage />;
}

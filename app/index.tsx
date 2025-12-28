import useAuth from "@/auth-protect/useAuth";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import LandingPage from "./page/landing-page";

export default function Index() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace("/auth/login");
    } else {
      // If authenticated, send to play by default
      router.replace("/play");
    }
  }, [auth.isAuthenticated]);

  // don't render the landing page while redirecting
  if (!auth.isAuthenticated) return null;

  return <LandingPage />;
}

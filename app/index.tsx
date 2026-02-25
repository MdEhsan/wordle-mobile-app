import WordleLoader from "@/components/loader";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";

export default function Index() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;
      router.replace("/auth/login");
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return <WordleLoader visible={true} splash={true} hideMessage={true} />;
}

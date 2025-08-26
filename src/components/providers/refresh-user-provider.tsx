"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { auth } from "@/axios/auth";
import { LoadingScreen } from "@/components/layouts/loading-screen";

interface RefreshUserProviderProps {
  children: React.ReactNode;
}

export const RefreshUserProvider = ({ children }: RefreshUserProviderProps) => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await useAuthStore.persist.rehydrate();

        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          const user = await auth.me();
          setAuth({
            accessToken,
            user,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [setAuth, clearAuth]);

  if (isLoading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  return <>{children}</>;
};

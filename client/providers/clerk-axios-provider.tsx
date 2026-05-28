"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";

export const ClerkAxiosProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error setting Clerk Authorization header:", error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return <>{children}</>;
};

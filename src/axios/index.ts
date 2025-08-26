import { useAuthStore } from "@/stores/auth.store";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Track retry attempts for each request
const retryMap = new Map<string, number>();
const MAX_RETRY_ATTEMPTS = 3;

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
        return Promise.reject(error);
      }

      const requestKey = `${originalRequest.method}-${originalRequest.url}`;
      const currentRetries = retryMap.get(requestKey) || 0;

      if (currentRetries >= MAX_RETRY_ATTEMPTS) {
        retryMap.delete(requestKey);
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      retryMap.set(requestKey, currentRetries + 1);

      try {
        const refreshResponse = await axiosInstance.post<{
          accessToken: string;
        }>("/auth/refresh");
        const { accessToken } = refreshResponse.data;

        const authStore = useAuthStore.getState();
        if (authStore.user) {
          authStore.setAuth({
            accessToken,
            user: authStore.user,
            isAuthenticated: true,
          });
        }

        retryMap.delete(requestKey);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const newRetryCount = retryMap.get(requestKey) || 0;
        if (newRetryCount < MAX_RETRY_ATTEMPTS) {
          return Promise.reject(error);
        } else {
          retryMap.delete(requestKey);
          useAuthStore.getState().clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/sign-in";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

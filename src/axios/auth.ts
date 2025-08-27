import { SignInSchema, SignUpSchema } from "@/zod/auth";
import { axiosInstance } from ".";
import { SignInResponse, SignUpResponse } from "@/types/auth";
import { AxiosError } from "axios";
import { IUser } from "@/db/schema";

export const auth = {
  signIn: async (data: SignInSchema) => {
    try {
      const response = await axiosInstance.post<SignInResponse>(
        "/auth/sign-in",
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data.error;
      }
      throw error;
    }
  },

  signUp: async (data: SignUpSchema) => {
    try {
      const response = await axiosInstance.post<SignUpResponse>(
        "/auth/sign-up",
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data.error;
      }
      throw error;
    }
  },

  me: async () => {
    try {
      const response =
        await axiosInstance.get<Omit<IUser, "password">>("/auth/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data.error;
      }
      throw error;
    }
  },

  refresh: async () => {
    try {
      const response = await axiosInstance.post<{ accessToken: string }>(
        "/auth/refresh",
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data.error;
      }
      throw error;
    }
  },

  signOut: async () => {
    try {
      await axiosInstance.post("/auth/revoke");
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data.error;
      }
      throw error;
    }
  },
};

import { SignInSchema, SignUpSchema } from "@/zod/auth";
import { axiosInstance } from ".";
import { SignInResponse, SignUpResponse } from "@/types/auth";
import { AxiosError } from "axios";

export const auth = {
  signIn: async (data: SignInSchema) => {
    try {
      const response = await axiosInstance.post<SignInResponse>(
        "/auth/sign-in",
        data
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
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data.error;
      }
      throw error;
    }
  },
};

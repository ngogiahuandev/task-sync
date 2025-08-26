import { IUser } from "@/db/schema";

export type SignInResponse = {
  accessToken: string;
  user: Omit<IUser, "password">;
};

export type SignUpResponse = SignInResponse;

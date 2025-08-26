import { IUser } from "@/db/schema";

export type LoginResponse = {
  accessToken: string;
  user: Omit<IUser, "password">;
};

import { api } from "@/services/http/client";
import { authEndpoints } from "./endpoints";
import type { AuthUser, LoginCredentials, TokenResponse } from "./types";

export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
  return api.post<TokenResponse>(authEndpoints.login, credentials);
}

export async function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>(authEndpoints.me);
}

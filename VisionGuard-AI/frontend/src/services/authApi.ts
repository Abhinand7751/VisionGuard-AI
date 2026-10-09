import { apiClient } from "./api";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
};

export type LoginResult = {
  access_token: string;
  token_type: string;
};

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult> {
  const formData = new URLSearchParams();
  formData.set("username", email.trim());
  formData.set("password", password);

  const response = await apiClient.post<LoginResult>(
    "/auth/login",
    formData.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return response.data;
}

export async function getCurrentUser(token?: string): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>("/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

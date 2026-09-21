import api from "./axios";

export interface Account {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const getAccount = async (): Promise<Account> => {
  const response = await api.get<{ success: boolean; data: Account }>(
    "/account"
  );

  return response.data.data;
};

export interface UpdateAccountInput {
  name: string;
  email: string;
}

export const updateAccount = async (
  input: UpdateAccountInput
): Promise<Account> => {
  const response = await api.patch<{ success: boolean; data: Account }>(
    "/account",
    input
  );

  return response.data.data;
};

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePassword = async (
  input: ChangePasswordInput
): Promise<void> => {
  await api.patch("/account/password", input);
};

export const logoutAllDevices = async (): Promise<void> => {
  await api.post("/account/logout-all");
};

export const exportAccountData = async (): Promise<unknown> => {
  const response = await api.get<{ success: boolean; data: unknown }>(
    "/account/export"
  );

  return response.data.data;
};

export const deleteAccount = async (password: string): Promise<void> => {
  await api.delete("/account", { data: { password } });
};

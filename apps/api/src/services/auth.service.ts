import jwt from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from "../repositories/auth.repository";
import { env } from "../config/env";
import { hashPassword, comparePassword } from "../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { RegisterInput } from "../validations/auth.validation";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await createUser(
    data.name,
    data.email,
    hashedPassword
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await saveRefreshToken(
    refreshToken,
    user.id,
    expiresAt
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUserToken = async (
  token: string
) => {
  const storedToken = await findRefreshToken(token);

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  jwt.verify(token, env.JWT_REFRESH_SECRET);

  const accessToken = generateAccessToken(
    storedToken.user.id
  );

  return {
    accessToken,
  };
};

export const logoutUser = async (
  token: string
) => {
  await deleteRefreshToken(token);
};
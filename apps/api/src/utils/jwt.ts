import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

const accessSecret: Secret = env.JWT_ACCESS_SECRET;
const refreshSecret: Secret = env.JWT_REFRESH_SECRET;

const accessOptions: SignOptions = {
  expiresIn: "15m",
};

const refreshOptions: SignOptions = {
  expiresIn: "7d",
};

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, accessSecret, accessOptions);
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, refreshSecret, refreshOptions);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, accessSecret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, refreshSecret);
};
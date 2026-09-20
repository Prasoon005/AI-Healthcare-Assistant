import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET || "your-access-secret",

  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret",

  ACCESS_TOKEN_EXPIRES_IN: "15m",

  REFRESH_TOKEN_EXPIRES_IN: "7d",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
};
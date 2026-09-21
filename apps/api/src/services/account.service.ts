import fs from "fs/promises";

import {
  deleteAllRefreshTokensForUser,
  findUserByEmail,
  findUserById,
} from "../repositories/auth.repository";
import {
  deleteAccountById,
  findAccountById,
  updateAccount as updateAccountRepo,
  updateAccountPassword,
} from "../repositories/account.repository";
import { hashPassword, comparePassword } from "../utils/hash";

import { findProfileByUserId } from "../repositories/profile.repository";
import { findAllMedicationsByUser } from "../repositories/medication.repository";
import { getUserVitalLogsInRange } from "../repositories/vital.repository";
import { findAnalysesByUserInRange } from "../repositories/analysis.repository";
import {
  findAllReportsFullByUser,
} from "../repositories/report.repository";
import { getUserDocuments } from "../repositories/document.repository";

import type {
  ChangePasswordInput,
  UpdateAccountInput,
} from "../validations/account.validation";

export const getAccount = async (userId: string) => {
  const account = await findAccountById(userId);

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
};

export const updateAccount = async (
  userId: string,
  data: UpdateAccountInput
) => {
  const existing = await findUserByEmail(data.email);

  if (existing && existing.id !== userId) {
    throw new Error("This email is already in use by another account");
  }

  return updateAccountRepo(userId, data);
};

export const changePassword = async (
  userId: string,
  data: ChangePasswordInput
) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("Account not found");
  }

  const isCurrentPasswordValid = await comparePassword(
    data.currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await hashPassword(data.newPassword);

  await updateAccountPassword(userId, hashedPassword);

  // Changing a password invalidates every existing session for safety.
  await deleteAllRefreshTokensForUser(userId);
};

export const logoutAllDevices = async (userId: string) => {
  await deleteAllRefreshTokensForUser(userId);
};

export const deleteAccount = async (userId: string, password: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("Account not found");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Password is incorrect");
  }

  const documents = await getUserDocuments(userId);

  // Prisma cascade (onDelete: Cascade on every user-owned model) removes
  // every DB row; it cannot remove files on disk, so those are cleaned up
  // separately using the same best-effort pattern as document.service.ts.
  await deleteAccountById(userId);

  await Promise.all(
    documents.map((doc) => fs.unlink(doc.filePath).catch(() => {}))
  );
};

export const exportAccountData = async (userId: string) => {
  const now = new Date();

  const [
    account,
    profile,
    medications,
    vitals,
    analyses,
    reports,
    documents,
  ] = await Promise.all([
    findAccountById(userId),
    findProfileByUserId(userId),
    findAllMedicationsByUser(userId),
    getUserVitalLogsInRange(userId, null, now),
    findAnalysesByUserInRange(userId, null, now),
    findAllReportsFullByUser(userId),
    getUserDocuments(userId),
  ]);

  return {
    exportedAt: now.toISOString(),
    account,
    healthProfile: profile,
    medications,
    vitals,
    healthAnalyses: analyses,
    healthReports: reports,
    medicalDocuments: documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      extractedText: doc.extractedText,
      createdAt: doc.createdAt,
    })),
  };
};

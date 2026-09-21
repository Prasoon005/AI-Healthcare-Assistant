import {
  findProfileByUserId,
  upsertProfile,
} from "../repositories/profile.repository";

import type { UpdateProfileInput } from "../validations/profile.validation";

/*
 * Full health-profile completeness (13 fields).
 * This is intentionally separate from risk.service's
 * completeness, which only tracks the 7 lifestyle fields
 * relevant to the wellness score calculation.
 */
const PROFILE_FIELDS = [
  "age",
  "gender",
  "height",
  "weight",
  "smoking",
  "alcohol",
  "exerciseDays",
  "sleepHours",
  "allergies",
  "medicalConditions",
  "medications",
  "emergencyName",
  "emergencyPhone",
] as const;

export const calculateCompletion = (
  profile: Record<string, unknown> | null
) => {
  if (!profile) return 0;

  const filled = PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    return (
      value !== null &&
      value !== undefined &&
      value !== ""
    );
  }).length;

  return Math.round(
    (filled / PROFILE_FIELDS.length) * 100
  );
};

export const getProfile = async (userId: string) => {
  const profile = await findProfileByUserId(userId);

  return {
    profile,
    completion: calculateCompletion(profile),
  };
};

export const saveProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  const profile = await upsertProfile(userId, data);

  return {
    profile,
    completion: calculateCompletion(profile),
  };
};

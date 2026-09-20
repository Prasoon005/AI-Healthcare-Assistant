import { prisma } from "../config/prisma";
import type { UpdateProfileInput } from "../validations/profile.validation";

export const findProfileByUserId = async (
  userId: string
) => {
  return prisma.healthProfile.findUnique({
    where: {
      userId,
    },
  });
};

export const upsertProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  return prisma.healthProfile.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      ...data,
    },
    update: {
      ...data,
    },
  });
};

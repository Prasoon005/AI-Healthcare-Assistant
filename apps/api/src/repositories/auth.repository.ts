import { prisma } from "../config/prisma";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const createUser = (
  name: string,
  email: string,
  password: string
) => {
  return prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
};

export const saveRefreshToken = (
  token: string,
  userId: string,
  expiresAt: Date
) => {
  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

export const findRefreshToken = (token: string) => {
  return prisma.refreshToken.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });
};

export const deleteRefreshToken = (token: string) => {
  return prisma.refreshToken.deleteMany({
    where: {
      token,
    },
  });
};
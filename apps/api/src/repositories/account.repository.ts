import { prisma } from "../config/prisma";

export const findAccountById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};

export const updateAccount = (
  userId: string,
  data: { name: string; email: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};

export const updateAccountPassword = (
  userId: string,
  hashedPassword: string
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

export const deleteAccountById = (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

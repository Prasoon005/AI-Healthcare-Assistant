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
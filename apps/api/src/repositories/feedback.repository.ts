import { prisma } from "../config/prisma";
import type { CreateFeedbackInput } from "../validations/feedback.validation";

export const createFeedback = (
  userId: string,
  data: CreateFeedbackInput
) => {
  return prisma.feedback.create({
    data: {
      userId,
      message: data.message,
      category: data.category,
    },
  });
};

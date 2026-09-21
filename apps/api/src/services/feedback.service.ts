import { createFeedback } from "../repositories/feedback.repository";
import type { CreateFeedbackInput } from "../validations/feedback.validation";

export const submitFeedback = async (
  userId: string,
  data: CreateFeedbackInput
) => {
  return createFeedback(userId, data);
};

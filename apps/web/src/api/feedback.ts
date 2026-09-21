import api from "./axios";

export type FeedbackCategory = "BUG" | "IDEA" | "OTHER";

export const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "BUG", label: "Report a bug" },
  { value: "IDEA", label: "Suggest an idea" },
  { value: "OTHER", label: "Something else" },
];

export interface SubmitFeedbackInput {
  message: string;
  category?: FeedbackCategory;
}

export const submitFeedback = async (
  input: SubmitFeedbackInput
): Promise<void> => {
  await api.post("/feedback", input);
};

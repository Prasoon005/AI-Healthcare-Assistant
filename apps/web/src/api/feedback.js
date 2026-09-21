import api from "./axios";
export const FEEDBACK_CATEGORY_OPTIONS = [
    { value: "BUG", label: "Report a bug" },
    { value: "IDEA", label: "Suggest an idea" },
    { value: "OTHER", label: "Something else" },
];
export const submitFeedback = async (input) => {
    await api.post("/feedback", input);
};

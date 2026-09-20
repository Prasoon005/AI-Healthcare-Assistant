import api from "./axios";

export type Gender =
  | "MALE"
  | "FEMALE"
  | "OTHER"
  | "PREFER_NOT_TO_SAY";

export interface HealthProfile {
  id: string;
  age: number | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  smoking: boolean | null;
  alcohol: boolean | null;
  exerciseDays: number | null;
  sleepHours: number | null;
  allergies: string | null;
  medicalConditions: string | null;
  medications: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  profile: HealthProfile | null;
  completion: number;
}

export type UpdateProfileInput = {
  age: number | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  smoking: boolean | null;
  alcohol: boolean | null;
  exerciseDays: number | null;
  sleepHours: number | null;
  allergies: string | null;
  medicalConditions: string | null;
  medications: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
};

export const getHealthProfile =
  async (): Promise<ProfileResponse> => {
    const response = await api.get<{
      success: boolean;
      data: ProfileResponse;
    }>("/profile");

    return response.data.data;
  };

export const saveHealthProfile = async (
  data: UpdateProfileInput
): Promise<ProfileResponse> => {
  const response = await api.put<{
    success: boolean;
    data: ProfileResponse;
  }>("/profile", data);

  return response.data.data;
};

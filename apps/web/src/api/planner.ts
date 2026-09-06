import api from "./axios";

export interface PlannerItem {
  title: string;
  target: string;
  completed: boolean;
}

export interface DailyPlan {
  profileAvailable: boolean;

  plan: {
    hydration: PlannerItem;
    activity: PlannerItem;
    sleep: PlannerItem;
    nutrition: PlannerItem;
  };
}

export const getDailyPlan = async (): Promise<DailyPlan> => {
  const response = await api.get<{
    success: boolean;
    data: DailyPlan;
  }>("/planner");

  return response.data.data;
};
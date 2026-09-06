import { prisma } from "../config/prisma";

export const getDailyPlan = async (userId: string) => {
  const profile = await prisma.healthProfile.findUnique({
    where: {
      userId,
    },
  });

  const plan = {
    hydration: {
      title: "Stay hydrated",
      target: "6–8 glasses",
      completed: false,
    },

    activity: {
      title: "Daily movement",
      target: "20–30 minutes",
      completed: false,
    },

    sleep: {
      title: "Sleep routine",
      target: "7–9 hours",
      completed: false,
    },

    nutrition: {
      title: "Balanced meals",
      target: "Include protein + vegetables",
      completed: false,
    },
  };

  if (profile?.exerciseDays !== null && profile?.exerciseDays !== undefined) {
    if (profile.exerciseDays < 3) {
      plan.activity.target = "10–20 minutes of light movement";
    } else {
      plan.activity.target = "20–30 minutes of movement";
    }
  }

  if (profile?.sleepHours !== null && profile?.sleepHours !== undefined) {
    if (profile.sleepHours < 7) {
      plan.sleep.target = "Aim for 7–9 hours";
    }
  }

  return {
    profileAvailable: !!profile,
    plan,
  };
};
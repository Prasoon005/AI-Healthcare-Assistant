import { prisma } from "../config/prisma";

type RiskLevel = "low" | "moderate" | "high";

interface RiskItem {
  key: string;
  label: string;
  score: number;
  level: RiskLevel;
  description: string;
}

const getLevel = (score: number): RiskLevel => {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  return "high";
};

export const calculateRiskMatrix = async (
  userId: string
) => {
  const profile = await prisma.healthProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    return {
      available: false,
      items: [],
      completeness: 0,
      overallWellnessScore: null,
    };
  }

  let filledFields = 0;
  let totalFields = 0;

  const track = (value: unknown) => {
    totalFields++;

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      filledFields++;
    }
  };

  track(profile.age);
  track(profile.height);
  track(profile.weight);
  track(profile.smoking);
  track(profile.alcohol);
  track(profile.exerciseDays);
  track(profile.sleepHours);

  const completeness =
    totalFields === 0
      ? 0
      : Math.round(
          (filledFields / totalFields) * 100
        );

  /*
   * These are wellness attention scores.
   * They are NOT clinical disease probabilities.
   */

  // Cardiovascular wellness
  let cardioScore = 0;

  if (profile.smoking === true) {
    cardioScore += 35;
  }

  if (
    profile.exerciseDays !== null &&
    profile.exerciseDays !== undefined
  ) {
    if (profile.exerciseDays < 2) {
      cardioScore += 30;
    } else if (profile.exerciseDays < 4) {
      cardioScore += 15;
    }
  }

  if (
    profile.age !== null &&
    profile.age !== undefined &&
    profile.age >= 50
  ) {
    cardioScore += 15;
  }

  if (profile.alcohol === true) {
    cardioScore += 10;
  }

  cardioScore = Math.min(cardioScore, 100);

  // Metabolic wellness
  let metabolicScore = 0;

  if (
    profile.exerciseDays !== null &&
    profile.exerciseDays !== undefined
  ) {
    if (profile.exerciseDays < 2) {
      metabolicScore += 30;
    } else if (profile.exerciseDays < 4) {
      metabolicScore += 15;
    }
  }

  if (
    profile.height &&
    profile.weight &&
    profile.height > 0
  ) {
    const heightMeters =
      profile.height / 100;

    const bmi =
      profile.weight /
      (heightMeters * heightMeters);

    if (bmi >= 30) {
      metabolicScore += 30;
    } else if (bmi >= 25) {
      metabolicScore += 15;
    }
  }

  if (profile.smoking === true) {
    metabolicScore += 10;
  }

  metabolicScore = Math.min(
    metabolicScore,
    100
  );

  // Recovery / fatigue wellness
  let recoveryScore = 0;

  if (
    profile.sleepHours !== null &&
    profile.sleepHours !== undefined
  ) {
    if (profile.sleepHours < 6) {
      recoveryScore += 45;
    } else if (profile.sleepHours < 7) {
      recoveryScore += 25;
    }
  }

  if (
    profile.exerciseDays !== null &&
    profile.exerciseDays !== undefined &&
    profile.exerciseDays === 0
  ) {
    recoveryScore += 15;
  }

  recoveryScore = Math.min(
    recoveryScore,
    100
  );

  const items: RiskItem[] = [
    {
      key: "cardio",
      label: "Cardiovascular wellness",
      score: cardioScore,
      level: getLevel(cardioScore),
      description:
        cardioScore <= 30
          ? "Your current profile shows relatively few lifestyle attention factors."
          : cardioScore <= 60
          ? "Some lifestyle factors may benefit from attention."
          : "Several lifestyle factors may benefit from improvement.",
    },
    {
      key: "metabolic",
      label: "Metabolic wellness",
      score: metabolicScore,
      level: getLevel(metabolicScore),
      description:
        metabolicScore <= 30
          ? "Your current activity and profile data show relatively few attention factors."
          : metabolicScore <= 60
          ? "Some lifestyle factors may benefit from attention."
          : "Several lifestyle factors may benefit from improvement.",
    },
    {
      key: "recovery",
      label: "Recovery & fatigue",
      score: recoveryScore,
      level: getLevel(recoveryScore),
      description:
        recoveryScore <= 30
          ? "Your recorded sleep and activity profile looks relatively balanced."
          : recoveryScore <= 60
          ? "Your recovery habits may benefit from some attention."
          : "Your current recovery profile suggests several areas to review.",
    },
  ];

  /*
   * cardio/metabolic/recovery above are "attention needed" scores, where
   * HIGHER means more lifestyle factors worth attention (worse). The
   * dashboard's wellness indicator is the inverse of their average, so
   * higher there reads as "better" - do not flip this without updating
   * both meanings consistently.
   */
  const averageAttention =
    (cardioScore + metabolicScore + recoveryScore) / 3;
  const overallWellnessScore = Math.round(100 - averageAttention);

  return {
    available: true,
    completeness,
    items,
    overallWellnessScore,
    disclaimer:
      "These indicators are lifestyle-based wellness signals, not medical diagnoses or disease probabilities.",
  };
};
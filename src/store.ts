import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Gender = "M" | "F";
export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "EXTREME";
export type Language = "en" | "hi";

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  language?: Language;
}

export interface LogEntry {
  id: string;
  type: "FOOD" | "EXERCISE";
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string; // YYYY-MM-DD format
  items?: { name: string; quantity: string }[];
}

export type FastingProtocol = "12:12" | "14:10" | "16:8" | "18:6" | "20:4";
export interface FastingState {
  isActive: boolean;
  startTime: string | null;
  protocol: FastingProtocol;
}

interface AppState {
  profile: UserProfile | null;
  logs: LogEntry[];
  waterLogs: Record<string, number>;
  fasting: FastingState;
  wellnessLogs: Record<string, { sleep: number; mood: string }>;
  stepLogs: Record<string, number>;
  weightLogs: Record<string, number>;
  completedChallenges: Record<string, string[]>;
  setProfile: (profile: UserProfile) => void;
  updateProfileByPlan: (recommendedCalories: number) => void;
  addLog: (log: Omit<LogEntry, "id">) => void;
  deleteLog: (id: string) => void;
  addWater: (date: string, amount: number) => void;
  resetWater: (date: string) => void;
  addSteps: (date: string, steps: number) => void;
  resetSteps: (date: string) => void;
  logWeight: (date: string, weight: number) => void;
  setFasting: (fasting: FastingState) => void;
  logWellness: (date: string, sleep: number, mood: string) => void;
  toggleChallenge: (date: string, challengeId: string) => void;
  plannedCaloriesOverride: number | null;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      logs: [],
      waterLogs: {},
      fasting: { isActive: false, startTime: null, protocol: "16:8" },
      wellnessLogs: {},
      stepLogs: {},
      weightLogs: {},
      completedChallenges: {},
      plannedCaloriesOverride: null,

      setProfile: (profile) => set({ profile }),
      
      updateProfileByPlan: (recommendedCalories) =>
        set({ plannedCaloriesOverride: recommendedCalories }),

      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { ...log, id: Math.random().toString(36).substring(2, 9) },
          ],
        })),

      deleteLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        })),

      addWater: (date, amount) =>
        set((state) => ({
          waterLogs: {
            ...state.waterLogs,
            [date]: (state.waterLogs[date] || 0) + amount,
          },
        })),

      resetWater: (date) =>
        set((state) => ({
          waterLogs: {
            ...state.waterLogs,
            [date]: 0,
          },
        })),

      addSteps: (date, steps) =>
        set((state) => ({
          stepLogs: {
            ...state.stepLogs,
            [date]: (state.stepLogs[date] || 0) + steps,
          },
        })),

      resetSteps: (date) =>
        set((state) => ({
          stepLogs: {
            ...state.stepLogs,
            [date]: 0,
          },
        })),

      logWeight: (date, weight) =>
        set((state) => {
          let mergedProfile = state.profile;
          if (mergedProfile) {
              mergedProfile = { ...mergedProfile, weight };
          }
          return {
            weightLogs: {
              ...state.weightLogs,
              [date]: weight,
            },
            profile: mergedProfile,
          };
        }),

      setFasting: (fasting) => set({ fasting }),
      
      logWellness: (date, sleep, mood) => set((state) => ({
        wellnessLogs: {
          ...state.wellnessLogs,
          [date]: { sleep, mood }
        }
      })),

      toggleChallenge: (date, challengeId) => set((state) => {
        const todayChallenges = state.completedChallenges[date] || [];
        const isCompleted = todayChallenges.includes(challengeId);
        return {
          completedChallenges: {
            ...state.completedChallenges,
            [date]: isCompleted 
              ? todayChallenges.filter(id => id !== challengeId)
              : [...todayChallenges, challengeId]
          }
        }
      }),
    }),
    {
      name: "nutrisnap-storage",
    }
  )
);

// Computed State Helper
export function useCalorieTracking(dateStr: string) {
  const { profile, logs, plannedCaloriesOverride } = useStore();

  if (!profile) return null;

  const { weight, height, age, gender, activityLevel } = profile;

  // 1. BMI Calculation
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let bmiCategory = "Normal";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi >= 25 && bmi < 30) bmiCategory = "Overweight";
  else if (bmi >= 30) bmiCategory = "Obese";

  // 2. BMR & TDEE
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "M" ? 5 : -161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725,
    EXTREME: 1.9,
  };
  let tdee = bmr * activityMultipliers[activityLevel];

  // Adjust for weight goal targeting
  let targetCalories = Math.round(tdee);
  if (profile.targetWeight < profile.weight) {
    targetCalories -= 500;
  } else if (profile.targetWeight > profile.weight) {
    targetCalories += 500;
  }

  // Override with AI plan if available
  if (plannedCaloriesOverride) {
    targetCalories = plannedCaloriesOverride;
  }

  // 3. Daily Logs filtering
  const todaysLogs = logs.filter((l) => l.date === dateStr);
  let consumedCalories = 0;
  let burnedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFats = 0;

  todaysLogs.forEach((log) => {
    if (log.type === "FOOD") {
      consumedCalories += log.calories;
      consumedProtein += log.protein;
      consumedCarbs += log.carbs;
      consumedFats += log.fats;
    } else {
      burnedCalories += log.calories;
    }
  });

  const netCalories = consumedCalories - burnedCalories;
  const remainingCalories = Math.max(0, targetCalories - netCalories);

  // 4. Macros calculation
  const targetProtein = Math.round(weight * 2);
  const targetFats = Math.round(weight * 0.8);
  const remainingCalsForCarbs = Math.max(
    0,
    targetCalories - (targetProtein * 4 + targetFats * 9)
  );
  const targetCarbs = Math.round(remainingCalsForCarbs / 4);

  return {
    bmi: bmi.toFixed(1),
    bmiCategory,
    targetCalories,
    consumedCalories,
    burnedCalories,
    netCalories,
    remainingCalories,
    macros: {
      protein: { limit: targetProtein, consumed: Math.round(consumedProtein) },
      carbs: { limit: targetCarbs, consumed: Math.round(consumedCarbs) },
      fats: { limit: targetFats, consumed: Math.round(consumedFats) },
    },
    todaysLogs,
  };
}

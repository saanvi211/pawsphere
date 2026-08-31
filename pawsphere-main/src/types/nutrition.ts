export interface MealRecord {
  id: string;
  name: string;
  mealTime: string;
  portion: string;
  calories: number;
  eaten: boolean;
  createdAt: string;
}

export interface WaterRecord {
  id: string;
  amountMl: number;
  recordedAt: string;
}

export interface WeightRecord {
  id: string;
  weightKg: number;
  recordedAt: string;
}

export interface TreatRecord {
  id: string;
  name: string;
  calories: number;
  recordedAt: string;
}

export interface NutritionData {
  meals: MealRecord[];
  water: WaterRecord[];
  weights: WeightRecord[];
  treats: TreatRecord[];
  goalWeightKg: number | null;
}

export interface MealPlanDay {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  completed: boolean;
}

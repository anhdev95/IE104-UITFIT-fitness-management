export interface BmiCategory {
  key: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
}

export interface HealthRecord {
  id: number;
  record_date: string;
  weight: number;
  height: number;
  bmi: number;
  bmi_category: BmiCategory | null;
  body_fat: number | null;
  muscle_mass: number | null;
  waist: number | null;
  chest: number | null;
  note: string | null;
  created_at: string;
}

export interface HealthRecordPayload {
  record_date: string;
  weight: number;
  height: number;
  body_fat: number | null;
  muscle_mass: number | null;
  waist: number | null;
  chest: number | null;
  note: string | null;
}

export type HealthRange = '7d' | '30d' | '3m' | '6m' | '1y';

export interface HealthStatistics {
  range: HealthRange;
  from: string;
  to: string;
  summary: {
    startWeight: number | null;
    currentWeight: number | null;
    weightChange: number | null;
    currentBmi: number | null;
    bmiCategory: BmiCategory | null;
    bodyFat: number | null;
    bodyFatChange: number | null;
    muscleMass: number | null;
    muscleMassChange: number | null;
    recordsCount: number;
  };
  series: { date: string; weight: number; bmi: number; body_fat: number | null; muscle_mass: number | null }[];
  records: HealthRecord[];
}

import { MuscleGroup } from './exercise.model';
import { WorkoutSet } from './workout-set.model';

export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';

export interface SessionSummary {
  total_exercises: number;
  completed_exercises: number;
  total_sets: number;
  completed_sets: number;
  total_reps: number;
  total_volume: number;
  progress: number;
}

export interface SessionExercise {
  exercise_id: number;
  exercise: {
    id: number;
    name: string;
    muscle_group: MuscleGroup;
    equipment: string | null;
    image_url: string | null;
  } | null;
  target_sets: number;
  target_reps: number | null;
  target_weight: number | null;
  rest_seconds: number;
  note: string | null;
  summary: SessionSummary;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: number;
  workout_plan_id: number | null;
  plan_name: string;
  plan: {
    id: number;
    name: string;
    scheduled_date: string | null;
    difficulty: string | null;
    description: string | null;
  } | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  status: SessionStatus;
  note: string | null;
  summary: SessionSummary | null;
  exercises?: SessionExercise[];
}

export interface HistoryFilter {
  from?: string;
  to?: string;
  status?: string;
  search?: string;
}

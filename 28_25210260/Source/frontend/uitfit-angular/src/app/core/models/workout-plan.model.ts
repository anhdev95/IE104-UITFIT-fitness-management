import { Difficulty, Exercise } from './exercise.model';

export type PlanStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type PlanTab = 'all' | 'in_progress' | 'completed' | 'not_started';

export interface WorkoutPlanExercise {
  id?: number;
  exercise_id: number;
  order_index: number;
  target_sets: number;
  target_reps: string;
  target_weight: number | null;
  rest_seconds: number;
  note: string | null;
  exercise?: Exercise | null;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  description: string | null;
  scheduled_date: string | null;
  estimated_duration: number | null;
  difficulty: Difficulty | null;
  status: PlanStatus;
  exercises_count: number;
  total_sets?: number;
  progress: number;
  active_session_id: number | null;
  exercises?: WorkoutPlanExercise[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanPayload {
  name: string;
  description: string | null;
  scheduled_date: string | null;
  estimated_duration: number | null;
  difficulty: Difficulty | null;
  exercises: Omit<WorkoutPlanExercise, 'id' | 'exercise'>[];
}

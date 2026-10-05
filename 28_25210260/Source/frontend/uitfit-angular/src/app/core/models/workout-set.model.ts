export interface WorkoutSet {
  id: number;
  workout_session_id: number;
  exercise_id: number;
  set_number: number;
  target_reps: number | null;
  actual_reps: number | null;
  target_weight: number | null;
  actual_weight: number | null;
  rpe: number | null;
  rest_seconds: number;
  completed: boolean;
  note: string | null;
  completed_at: string | null;
  volume: number;
}

export interface WorkoutSetPayload {
  actual_reps: number | null;
  actual_weight: number | null;
  rpe: number | null;
  rest_seconds: number | null;
  note: string | null;
  completed?: boolean;
}

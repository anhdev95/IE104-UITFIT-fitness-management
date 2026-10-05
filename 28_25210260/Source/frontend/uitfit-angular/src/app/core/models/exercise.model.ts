export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'cardio';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: number;
  name: string;
  slug: string;
  muscle_group: MuscleGroup;
  difficulty: Difficulty;
  equipment: string | null;
  description: string;
  instructions: string;
  instruction_steps: string[];
  target_muscles: string | null;
  tips: string | null;
  image: string | null;
  image_url: string | null;
  video_url: string | null;
  default_sets: number;
  default_reps: string;
  default_rest_seconds: number;
  status: 'active' | 'inactive';
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseFilter {
  search?: string;
  muscle_group?: string;
  difficulty?: string;
  status?: string;
}

export interface ExercisePayload {
  name: string;
  muscle_group: MuscleGroup;
  difficulty: Difficulty;
  equipment: string | null;
  description: string;
  instructions: string;
  target_muscles: string | null;
  tips: string | null;
  image: string | null;
  video_url: string | null;
  default_sets: number;
  default_reps: string;
  default_rest_seconds: number;
  status: 'active' | 'inactive';
}

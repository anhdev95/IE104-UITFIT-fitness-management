export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'locked';
export type Gender = 'male' | 'female' | 'other';
export type Goal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'general_fitness';

export interface UserProfile {
  gender: Gender | null;
  date_of_birth: string | null;
  height: number | null;
  current_weight: number | null;
  goal: Goal | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  profile?: UserProfile | null;
  workout_plans_count?: number;
  workout_sessions_count?: number;
  health_records_count?: number;
  created_at: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms: boolean;
}

export interface ProfilePayload {
  name: string;
  gender: Gender | null;
  date_of_birth: string | null;
  height: number | null;
  current_weight: number | null;
  goal: Goal | null;
  bio: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

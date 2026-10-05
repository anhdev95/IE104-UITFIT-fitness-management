import { BmiCategory } from './health-record.model';
import { PlanStatus } from './workout-plan.model';
import { User } from './user.model';

export interface PlanSummary {
  id: number;
  name: string;
  scheduled_date: string | null;
  status: PlanStatus;
  exercises_count: number;
  estimated_duration: number | null;
  progress: number;
  active_session_id: number | null;
}

export interface UserDashboard {
  user: { id: number; name: string };
  currentWeight: number | null;
  height: number | null;
  bmi: number | null;
  bmiCategory: BmiCategory | null;
  completedWorkouts: number;
  totalTrainingMinutes: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  todayWorkout: PlanSummary | null;
  weekPlans: PlanSummary[];
  weightProgress: { date: string; weight: number }[];
  recentSessions: { id: number; plan_name: string; completed_at: string; duration_seconds: number; total_volume: number }[];
}

export interface WorkoutStatistics {
  weekly: { week_start: string; label: string; sessions: number; minutes: number; volume: number }[];
  totals: { sessions: number; minutes: number };
}

export interface AdminDashboard {
  totalUsers: number;
  totalExercises: number;
  totalWorkoutPlans: number;
  totalWorkoutSessions: number;
  sessionsByMonth: { month: string; label: string; total: number }[];
  popularExercises: { id: number; name: string; muscle_group: string; usage_count: number }[];
  newUsers: User[];
}

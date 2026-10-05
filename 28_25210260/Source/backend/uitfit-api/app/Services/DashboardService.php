<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Http\Resources\WorkoutPlanResource;
use App\Models\Exercise;
use App\Models\User;
use App\Models\WorkoutPlan;
use App\Models\WorkoutSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /** Mục tiêu số buổi tập mỗi tuần */
    public const WEEKLY_GOAL = 5;

    public function __construct(private HealthService $health) {}

    public function forUser(User $user): array
    {
        $user->loadMissing('profile');
        $latest = $this->health->latest($user);

        $weight = $latest?->weight ?? $user->profile?->current_weight;
        $height = $latest?->height ?? $user->profile?->height;
        $bmi = $latest?->bmi ?? (($weight && $height) ? HealthService::calculateBmi($weight, $height) : null);

        $weekStart = now()->startOfWeek(Carbon::MONDAY);
        $weekEnd = now()->endOfWeek(Carbon::SUNDAY);

        $completed = $user->workoutSessions()->where('status', 'completed');

        $weeklyCompleted = (clone $completed)->whereBetween('completed_at', [$weekStart, $weekEnd])->count();

        $planQuery = fn () => $user->workoutPlans()
            ->with(['activeSession.sets'])
            ->withCount('planExercises');

        $today = $planQuery()
            ->whereDate('scheduled_date', today())
            ->orderByRaw("FIELD(status, 'in_progress', 'scheduled', 'draft', 'completed', 'cancelled')")
            ->first();

        $weekPlans = $planQuery()
            ->whereBetween('scheduled_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->orderBy('scheduled_date')
            ->get();

        $recentSessions = $user->workoutSessions()
            ->where('status', 'completed')
            ->with('sets')
            ->latest('completed_at')
            ->take(5)
            ->get();

        return [
            'user' => ['id' => $user->id, 'name' => $user->name],
            'currentWeight' => $weight,
            'height' => $height,
            'bmi' => $bmi,
            'bmiCategory' => HealthService::bmiCategory($bmi),
            'completedWorkouts' => (clone $completed)->count(),
            'totalTrainingMinutes' => (int) round((clone $completed)->sum('duration_seconds') / 60),
            'weeklyGoal' => self::WEEKLY_GOAL,
            'weeklyCompleted' => $weeklyCompleted,
            'todayWorkout' => $today ? $this->planSummary($today) : null,
            'weekPlans' => $weekPlans->map(fn ($p) => $this->planSummary($p))->values(),
            'weightProgress' => $user->healthRecords()
                ->orderByDesc('record_date')->take(12)->get(['record_date', 'weight'])
                ->sortBy('record_date')->values()
                ->map(fn ($r) => ['date' => $r->record_date->format('Y-m-d'), 'weight' => $r->weight]),
            'recentSessions' => $recentSessions->map(fn (WorkoutSession $s) => [
                'id' => $s->id,
                'plan_name' => $s->plan_name,
                'completed_at' => $s->completed_at,
                'duration_seconds' => $s->duration_seconds,
                'total_volume' => WorkoutService::summarize($s->sets)['total_volume'],
            ]),
        ];
    }

    private function planSummary(WorkoutPlan $plan): array
    {
        $resource = (new WorkoutPlanResource($plan))->resolve();

        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'scheduled_date' => $resource['scheduled_date'],
            'status' => $plan->status,
            'exercises_count' => $plan->plan_exercises_count,
            'estimated_duration' => $plan->estimated_duration,
            'progress' => $resource['progress'],
            'active_session_id' => $resource['active_session_id'],
        ];
    }

    public function forAdmin(): array
    {
        // Số buổi tập hoàn thành theo 6 tháng gần nhất
        $months = collect(range(5, 0))->map(fn ($i) => now()->startOfMonth()->subMonths($i));
        $counts = WorkoutSession::query()
            ->where('status', 'completed')
            ->where('completed_at', '>=', $months->first())
            ->selectRaw("DATE_FORMAT(completed_at, '%Y-%m') as ym, COUNT(*) as total")
            ->groupBy('ym')
            ->pluck('total', 'ym');

        $popular = Exercise::query()
            ->select('exercises.id', 'exercises.name', 'exercises.muscle_group', DB::raw('COUNT(workout_plan_exercises.id) as usage_count'))
            ->join('workout_plan_exercises', 'workout_plan_exercises.exercise_id', '=', 'exercises.id')
            ->groupBy('exercises.id', 'exercises.name', 'exercises.muscle_group')
            ->orderByDesc('usage_count')
            ->take(5)
            ->get();

        return [
            'totalUsers' => User::where('role', User::ROLE_USER)->count(),
            'totalExercises' => Exercise::count(),
            'totalWorkoutPlans' => WorkoutPlan::count(),
            'totalWorkoutSessions' => WorkoutSession::count(),
            'sessionsByMonth' => $months->map(fn (Carbon $m) => [
                'month' => $m->format('Y-m'),
                'label' => 'T'.$m->month.'/'.$m->year,
                'total' => (int) ($counts[$m->format('Y-m')] ?? 0),
            ])->values(),
            'popularExercises' => $popular->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'muscle_group' => $e->muscle_group,
                'usage_count' => (int) $e->usage_count,
            ]),
            'newUsers' => UserResource::collection(
                User::with('profile')->where('role', User::ROLE_USER)->latest()->take(5)->get()
            )->resolve(),
        ];
    }
}

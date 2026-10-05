<?php

namespace App\Services;

use App\Http\Resources\HealthRecordResource;
use App\Models\User;
use Carbon\Carbon;

class StatisticsService
{
    /** Khoảng thời gian hợp lệ cho filter tiến trình */
    public const RANGES = ['7d' => 7, '30d' => 30, '3m' => 90, '6m' => 180, '1y' => 365];

    public function health(User $user, string $range): array
    {
        $days = self::RANGES[$range] ?? 30;
        $from = today()->subDays($days - 1);

        $records = $user->healthRecords()
            ->where('record_date', '>=', $from)
            ->orderBy('record_date')
            ->orderBy('id')
            ->get();

        $first = $records->first();
        $last = $records->last();

        return [
            'range' => array_key_exists($range, self::RANGES) ? $range : '30d',
            'from' => $from->toDateString(),
            'to' => today()->toDateString(),
            'summary' => [
                'startWeight' => $first?->weight,
                'currentWeight' => $last?->weight,
                'weightChange' => ($first && $last) ? round($last->weight - $first->weight, 2) : null,
                'currentBmi' => $last?->bmi,
                'bmiCategory' => HealthService::bmiCategory($last?->bmi),
                'bodyFat' => $last?->body_fat,
                'bodyFatChange' => ($first?->body_fat && $last?->body_fat) ? round($last->body_fat - $first->body_fat, 2) : null,
                'muscleMass' => $last?->muscle_mass,
                'muscleMassChange' => ($first?->muscle_mass && $last?->muscle_mass) ? round($last->muscle_mass - $first->muscle_mass, 2) : null,
                'recordsCount' => $records->count(),
            ],
            'series' => $records->map(fn ($r) => [
                'date' => $r->record_date->format('Y-m-d'),
                'weight' => $r->weight,
                'bmi' => $r->bmi,
                'body_fat' => $r->body_fat,
                'muscle_mass' => $r->muscle_mass,
            ])->values(),
            'records' => HealthRecordResource::collection($records->sortByDesc('record_date')->values())->resolve(),
        ];
    }

    /** Thống kê tập luyện 8 tuần gần nhất: số buổi, tổng phút, tổng volume */
    public function workouts(User $user): array
    {
        $weeks = collect(range(7, 0))->map(fn ($i) => now()->startOfWeek(Carbon::MONDAY)->subWeeks($i));

        $sessions = $user->workoutSessions()
            ->where('status', 'completed')
            ->where('completed_at', '>=', $weeks->first())
            ->with('sets')
            ->get();

        return [
            'weekly' => $weeks->map(function (Carbon $start) use ($sessions) {
                $end = $start->copy()->endOfWeek(Carbon::SUNDAY);
                $inWeek = $sessions->filter(fn ($s) => $s->completed_at->between($start, $end));

                return [
                    'week_start' => $start->toDateString(),
                    'label' => $start->format('d/m'),
                    'sessions' => $inWeek->count(),
                    'minutes' => (int) round($inWeek->sum('duration_seconds') / 60),
                    'volume' => round($inWeek->sum(fn ($s) => WorkoutService::summarize($s->sets)['total_volume']), 2),
                ];
            })->values(),
            'totals' => [
                'sessions' => $user->workoutSessions()->where('status', 'completed')->count(),
                'minutes' => (int) round($user->workoutSessions()->where('status', 'completed')->sum('duration_seconds') / 60),
            ],
        ];
    }
}

<?php

namespace App\Services;

use App\Http\Resources\WorkoutSetResource;
use App\Models\User;
use App\Models\WorkoutPlan;
use App\Models\WorkoutSession;
use App\Models\WorkoutSet;
use App\Support\Media;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkoutService
{
    /* ---------------------------------------------------------------
     | Workout Plan (kế hoạch)
     * ------------------------------------------------------------- */

    public function createPlan(User $user, array $data): WorkoutPlan
    {
        return DB::transaction(function () use ($user, $data) {
            $plan = $user->workoutPlans()->create([
                ...$this->planAttributes($data),
                'status' => empty($data['scheduled_date']) ? 'draft' : 'scheduled',
            ]);
            $this->syncPlanExercises($plan, $data['exercises']);

            return $plan;
        });
    }

    public function updatePlan(WorkoutPlan $plan, array $data): WorkoutPlan
    {
        return DB::transaction(function () use ($plan, $data) {
            $attributes = $this->planAttributes($data);
            if (in_array($plan->status, ['draft', 'scheduled', 'cancelled'], true)) {
                $attributes['status'] = empty($data['scheduled_date']) ? 'draft' : 'scheduled';
            }
            $plan->update($attributes);
            $this->syncPlanExercises($plan, $data['exercises']);

            return $plan;
        });
    }

    private function planAttributes(array $data): array
    {
        return [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'estimated_duration' => $data['estimated_duration'] ?? null,
            'difficulty' => $data['difficulty'] ?? null,
        ];
    }

    /** Ghi đè danh sách bài tập của lịch theo thứ tự client gửi lên */
    private function syncPlanExercises(WorkoutPlan $plan, array $exercises): void
    {
        $plan->planExercises()->delete();

        $rows = collect($exercises)
            ->sortBy(fn ($e, $i) => $e['order_index'] ?? $i)
            ->values()
            ->map(fn ($e, $i) => [
                'exercise_id' => $e['exercise_id'],
                'order_index' => $i + 1,
                'target_sets' => $e['target_sets'],
                'target_reps' => preg_replace('/\s+/', '', (string) $e['target_reps']),
                'target_weight' => $e['target_weight'] ?? null,
                'rest_seconds' => $e['rest_seconds'] ?? 60,
                'note' => $e['note'] ?? null,
            ]);

        $plan->planExercises()->createMany($rows->all());
    }

    /* ---------------------------------------------------------------
     | Workout Session (lần tập thực tế)
     * ------------------------------------------------------------- */

    /**
     * Bắt đầu buổi tập từ lịch tập. Nếu lịch đang có buổi tập dở → trả lại buổi đó (tiếp tục tập).
     * Mỗi bài trong lịch sinh ra target_sets bản ghi workout_sets để người dùng ghi từng set.
     */
    public function startSession(WorkoutPlan $plan): WorkoutSession
    {
        $active = $plan->sessions()->where('status', 'in_progress')->latest('id')->first();
        if ($active) {
            return $active;
        }

        $plan->loadMissing('planExercises');
        if ($plan->planExercises->isEmpty()) {
            throw ValidationException::withMessages(['plan' => ['Lịch tập chưa có bài tập nào.']]);
        }

        return DB::transaction(function () use ($plan) {
            $session = WorkoutSession::create([
                'user_id' => $plan->user_id,
                'workout_plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'started_at' => now(),
                'status' => 'in_progress',
            ]);

            foreach ($plan->planExercises as $pe) {
                for ($i = 1; $i <= $pe->target_sets; $i++) {
                    $session->sets()->create([
                        'exercise_id' => $pe->exercise_id,
                        'set_number' => $i,
                        'target_reps' => self::parseReps($pe->target_reps),
                        'target_weight' => $pe->target_weight,
                        'rest_seconds' => $pe->rest_seconds,
                        'completed' => false,
                    ]);
                }
            }

            $plan->update(['status' => 'in_progress']);

            return $session;
        });
    }

    /** Thêm 1 set cho một bài tập trong buổi tập; mặc định copy target từ set trước */
    public function addSet(WorkoutSession $session, array $data): WorkoutSet
    {
        $this->ensureInProgress($session);

        $last = $session->sets()->where('exercise_id', $data['exercise_id'])->orderByDesc('set_number')->first();

        return $session->sets()->create([
            'exercise_id' => $data['exercise_id'],
            'set_number' => ($last?->set_number ?? 0) + 1,
            'target_reps' => $data['target_reps'] ?? $last?->target_reps,
            'target_weight' => $data['target_weight'] ?? $last?->target_weight,
            'rest_seconds' => $data['rest_seconds'] ?? $last?->rest_seconds ?? 60,
            'completed' => false,
        ]);
    }

    public function updateSet(WorkoutSet $set, array $data): WorkoutSet
    {
        $this->ensureInProgress($set->session);

        if (array_key_exists('completed', $data)) {
            $data['completed_at'] = $data['completed'] ? ($set->completed_at ?? now()) : null;
        }
        $set->update($data);

        return $set->fresh();
    }

    /** Chỉ xóa được set chưa hoàn thành; đánh số lại các set còn lại của bài đó */
    public function deleteSet(WorkoutSet $set): void
    {
        $this->ensureInProgress($set->session);

        if ($set->completed) {
            throw ValidationException::withMessages(['set' => ['Không thể xóa set đã hoàn thành.']]);
        }

        DB::transaction(function () use ($set) {
            $sessionId = $set->workout_session_id;
            $exerciseId = $set->exercise_id;
            $set->delete();

            WorkoutSet::where('workout_session_id', $sessionId)
                ->where('exercise_id', $exerciseId)
                ->orderBy('set_number')
                ->get()
                ->each(fn (WorkoutSet $s, int $i) => $s->update(['set_number' => $i + 1]));
        });
    }

    public function completeSession(WorkoutSession $session, ?string $note): WorkoutSession
    {
        $this->ensureInProgress($session);

        if (! $session->sets()->where('completed', true)->exists()) {
            throw ValidationException::withMessages(['session' => ['Bạn cần hoàn thành ít nhất 1 set trước khi kết thúc buổi tập.']]);
        }

        return DB::transaction(function () use ($session, $note) {
            $now = now();
            $session->update([
                'status' => 'completed',
                'completed_at' => $now,
                'duration_seconds' => (int) $session->started_at->diffInSeconds($now),
                'note' => $note,
            ]);
            $session->plan?->update(['status' => 'completed']);

            return $session;
        });
    }

    public function cancelSession(WorkoutSession $session): WorkoutSession
    {
        $this->ensureInProgress($session);

        return DB::transaction(function () use ($session) {
            $now = now();
            $session->update([
                'status' => 'cancelled',
                'completed_at' => $now,
                'duration_seconds' => (int) $session->started_at->diffInSeconds($now),
            ]);
            if ($plan = $session->plan) {
                $plan->update(['status' => $plan->scheduled_date ? 'scheduled' : 'draft']);
            }

            return $session;
        });
    }

    private function ensureInProgress(WorkoutSession $session): void
    {
        if ($session->status !== 'in_progress') {
            throw ValidationException::withMessages(['session' => ['Buổi tập đã kết thúc, không thể chỉnh sửa.']]);
        }
    }

    /* ---------------------------------------------------------------
     | Helpers
     * ------------------------------------------------------------- */

    /** "8-12" → 8, "10" → 10 */
    public static function parseReps(?string $reps): ?int
    {
        if ($reps === null || ! preg_match('/\d+/', $reps, $m)) {
            return null;
        }

        return (int) $m[0];
    }

    /** Tổng hợp số liệu từ danh sách set của một buổi tập */
    public static function summarize(Collection $sets): array
    {
        $completed = $sets->where('completed', true);
        $byExercise = $sets->groupBy('exercise_id');
        $total = $sets->count();

        return [
            'total_exercises' => $byExercise->count(),
            'completed_exercises' => $byExercise->filter(fn ($g) => $g->every(fn ($s) => $s->completed))->count(),
            'total_sets' => $total,
            'completed_sets' => $completed->count(),
            'total_reps' => (int) $completed->sum('actual_reps'),
            'total_volume' => round($completed->sum(fn ($s) => ($s->actual_reps ?? 0) * ($s->actual_weight ?? 0)), 2),
            'progress' => $total ? (int) round($completed->count() / $total * 100) : 0,
        ];
    }

    /**
     * Nhóm sets theo bài tập (giữ thứ tự xuất hiện) để hiển thị màn hình buổi tập / chi tiết lịch sử.
     */
    public static function groupSetsByExercise(WorkoutSession $session): array
    {
        $planNotes = $session->plan?->planExercises?->pluck('note', 'exercise_id') ?? collect();

        return $session->sets
            ->sortBy('id')
            ->groupBy('exercise_id')
            ->map(function (Collection $sets, $exerciseId) use ($planNotes) {
                $sets = $sets->sortBy('set_number')->values();
                $first = $sets->first();
                $exercise = $first->exercise;

                return [
                    'exercise_id' => (int) $exerciseId,
                    'exercise' => $exercise ? [
                        'id' => $exercise->id,
                        'name' => $exercise->name,
                        'muscle_group' => $exercise->muscle_group,
                        'equipment' => $exercise->equipment,
                        'image_url' => Media::url($exercise->image),
                    ] : null,
                    'target_sets' => $sets->count(),
                    'target_reps' => $first->target_reps,
                    'target_weight' => $first->target_weight,
                    'rest_seconds' => $first->rest_seconds,
                    'note' => $planNotes[$exerciseId] ?? null,
                    'summary' => self::summarize($sets),
                    'sets' => WorkoutSetResource::collection($sets)->resolve(),
                ];
            })
            ->values()
            ->all();
    }
}

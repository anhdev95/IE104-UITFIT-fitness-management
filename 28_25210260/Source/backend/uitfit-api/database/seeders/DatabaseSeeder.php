<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\User;
use App\Models\WorkoutPlan;
use App\Models\WorkoutSession;
use App\Services\HealthService;
use App\Services\WorkoutService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /** Các template lịch tập: [tên, mô tả, độ khó, thời lượng, [[bài, sets, reps, kg, rest]]] */
    private array $templates = [
        'push' => ['Push Day', 'Ngực – Vai – Tay sau', 'intermediate', 60, [
            ['Bench Press', 4, '10', 60, 90],
            ['Incline Dumbbell Press', 3, '12', 20, 60],
            ['Shoulder Press', 3, '12', 20, 60],
            ['Tricep Pushdown', 3, '15', 25, 45],
        ]],
        'pull' => ['Pull Day', 'Lưng – Tay trước', 'intermediate', 60, [
            ['Lat Pulldown', 4, '10', 50, 60],
            ['Barbell Row', 4, '8', 50, 90],
            ['Bicep Curl', 3, '12', 12, 60],
            ['Hammer Curl', 3, '12', 12, 45],
        ]],
        'legs' => ['Leg Day', 'Đùi – Mông – Bắp chân', 'advanced', 70, [
            ['Squat', 4, '8', 70, 120],
            ['Leg Press', 3, '12', 120, 90],
            ['Romanian Deadlift', 3, '10', 50, 90],
            ['Leg Extension', 3, '15', 35, 60],
        ]],
        'upper' => ['Upper Body', 'Thân trên tổng hợp', 'intermediate', 55, [
            ['Push Up', 3, '15', null, 60],
            ['Pull Up', 3, '8', null, 90],
            ['Lateral Raise', 3, '15', 8, 45],
            ['Chest Fly', 3, '12', 12, 60],
        ]],
        'core' => ['Core & Cardio', 'Cơ bụng và tim mạch', 'beginner', 30, [
            ['Jumping Jack', 3, '30', null, 30],
            ['Plank', 3, '45', null, 45],
            ['Crunch', 3, '20', null, 45],
            ['Mountain Climber', 3, '30', null, 30],
        ]],
    ];

    private array $exerciseIds = [];

    public function run(): void
    {
        mt_srand(28);

        $this->call(ExerciseSeeder::class);
        $this->exerciseIds = Exercise::pluck('id', 'name')->all();

        // ---------------- Admin ----------------
        $admin = User::create([
            'name' => 'Quản trị viên UITfit',
            'email' => 'admin@uitfit.com',
            'password' => Hash::make('123456'),
            'role' => User::ROLE_ADMIN,
        ]);
        $admin->profile()->create(['gender' => 'other', 'bio' => 'Tài khoản quản trị hệ thống UITfit.']);
        $admin->forceFill(['created_at' => now()->subMonths(7)])->save();

        // ---------------- User demo chính ----------------
        $user = User::create([
            'name' => 'Nguyễn Văn An',
            'email' => 'user@uitfit.com',
            'password' => Hash::make('123456'),
            'role' => User::ROLE_USER,
        ]);
        $user->forceFill(['created_at' => now()->subMonths(6)])->save();
        $user->profile()->create([
            'gender' => 'male',
            'date_of_birth' => '2003-05-15',
            'height' => 175,
            'current_weight' => 70,
            'goal' => 'gain_muscle',
            'bio' => 'Sinh viên UIT, đam mê gym và muốn tăng cơ giảm mỡ.',
        ]);
        $this->seedHealthRecords($user, 73.5, 70.0, 175, 20.5, 17.2, 30.8, 32.6, 26);

        // Lịch sử buổi tập 6 tháng gần nhất cho các lịch Push/Pull/Legs/Upper
        $plans = [];
        foreach (['push', 'pull', 'legs', 'upper'] as $key) {
            $plans[$key] = $this->createPlan($user, $key, null, 'completed');
        }
        $daysAgo = [2, 4, 6, 8, 11, 13, 15, 18, 20, 23, 26, 30, 34, 38, 43, 49, 56, 63, 71, 80, 92, 105, 118, 132, 147, 165];
        $rotation = ['pull', 'legs', 'upper', 'push'];
        foreach ($daysAgo as $i => $d) {
            $key = $rotation[$i % 4];
            $this->createCompletedSession($user, $plans[$key], now()->subDays($d)->setTime(18, 15), progress: 1 - $d / 400);
        }
        $plans['pull']->update(['scheduled_date' => today()->subDays(2), 'status' => 'completed']);
        $plans['legs']->update(['scheduled_date' => today()->subDays(4), 'status' => 'completed']);
        $plans['upper']->update(['scheduled_date' => today()->subDays(6), 'status' => 'completed']);
        $plans['push']->update(['scheduled_date' => today()->subDays(8), 'status' => 'completed']);

        // Lịch tập hôm nay (demo bắt đầu buổi tập) + lịch sắp tới + nháp
        $this->createPlan($user, 'push', today(), 'scheduled', 'Push Day');
        $this->createPlan($user, 'legs', today()->addDays(2), 'scheduled', 'Leg Day – Tuần này');
        $this->createPlan($user, 'core', null, 'draft');

        // ---------------- Các user khác (cho trang admin) ----------------
        $others = [
            ['Trần Thị Bình', 'binh@uitfit.com', 'female', 'lose_weight', 160, 58, 54, 'active', 5],
            ['Lê Minh Châu', 'chau@uitfit.com', 'male', 'gain_muscle', 170, 62, 65, 'active', 4],
            ['Phạm Quốc Dũng', 'dung@uitfit.com', 'male', 'maintain', 180, 78, 77, 'active', 3],
            ['Hoàng Gia Hân', 'han@uitfit.com', 'female', 'general_fitness', 158, 50, 50.5, 'active', 2],
            ['Võ Thanh Khoa', 'khoa@uitfit.com', 'male', 'lose_weight', 172, 85, 81, 'locked', 1],
        ];
        foreach ($others as $i => [$name, $email, $gender, $goal, $height, $w0, $w1, $status, $monthsAgo]) {
            $u = User::create([
                'name' => $name, 'email' => $email, 'password' => Hash::make('123456'),
                'role' => User::ROLE_USER, 'status' => $status,
            ]);
            $u->forceFill(['created_at' => now()->subMonths($monthsAgo)->subDays($i * 3)])->save();
            $u->profile()->create([
                'gender' => $gender, 'height' => $height, 'current_weight' => $w1, 'goal' => $goal,
                'date_of_birth' => (2000 + $i).'-0'.($i + 1).'-1'.$i,
            ]);
            $this->seedHealthRecords($u, $w0, $w1, $height, null, null, null, null, 6);

            $key = ['push', 'pull', 'legs', 'upper', 'core'][$i];
            $plan = $this->createPlan($u, $key, today()->subDays($i + 1), 'completed');
            $sessions = 2 + $i;
            for ($s = 0; $s < $sessions; $s++) {
                $this->createCompletedSession($u, $plan, now()->subDays(1 + $s * 9 + $i)->setTime(7, 30), progress: 0.9);
            }
        }
    }

    private function seedHealthRecords(User $user, float $w0, float $w1, float $height,
        ?float $fat0, ?float $fat1, ?float $muscle0, ?float $muscle1, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $t = $count > 1 ? $i / ($count - 1) : 1;
            $daysAgo = (int) round((1 - $t) * ($count - 1) * 7);
            $noise = $i === $count - 1 ? 0 : (mt_rand(-3, 3) / 10);
            $weight = round($w0 + ($w1 - $w0) * $t + $noise, 1);

            $user->healthRecords()->create([
                'record_date' => today()->subDays($daysAgo),
                'weight' => $weight,
                'height' => $height,
                'bmi' => HealthService::calculateBmi($weight, $height),
                'body_fat' => $fat0 ? round($fat0 + ($fat1 - $fat0) * $t, 1) : null,
                'muscle_mass' => $muscle0 ? round($muscle0 + ($muscle1 - $muscle0) * $t, 1) : null,
                'waist' => $fat0 ? round(84 - 4 * $t, 1) : null,
                'chest' => $fat0 ? round(95 + 2 * $t, 1) : null,
                'note' => $i === 0 ? 'Bắt đầu theo dõi chỉ số' : ($i === $count - 1 ? 'Cập nhật mới nhất' : null),
            ]);
        }
    }

    private function createPlan(User $user, string $key, ?Carbon $date, string $status, ?string $name = null): WorkoutPlan
    {
        [$tplName, $desc, $difficulty, $duration, $items] = $this->templates[$key];

        $plan = $user->workoutPlans()->create([
            'name' => $name ?? $tplName,
            'description' => $desc,
            'scheduled_date' => $date,
            'estimated_duration' => $duration,
            'difficulty' => $difficulty,
            'status' => $status,
        ]);

        foreach ($items as $i => [$exercise, $sets, $reps, $kg, $rest]) {
            $plan->planExercises()->create([
                'exercise_id' => $this->exerciseIds[$exercise],
                'order_index' => $i + 1,
                'target_sets' => $sets,
                'target_reps' => $reps,
                'target_weight' => $kg,
                'rest_seconds' => $rest,
            ]);
        }

        return $plan->load('planExercises');
    }

    /** Tạo 1 buổi tập đã hoàn thành với dữ liệu set thực tế ngẫu nhiên nhưng hợp lý */
    private function createCompletedSession(User $user, WorkoutPlan $plan, Carbon $startedAt, float $progress): void
    {
        $notes = [null, null, null, 'Form tốt', 'Hơi nặng', 'Kiểm soát tốt', 'Cần nghỉ lâu hơn'];
        $duration = ($plan->estimated_duration ?? 60) * 60 + mt_rand(-600, 600);

        $session = WorkoutSession::create([
            'user_id' => $user->id,
            'workout_plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'started_at' => $startedAt,
            'completed_at' => $startedAt->copy()->addSeconds($duration),
            'duration_seconds' => $duration,
            'status' => 'completed',
            'note' => mt_rand(0, 2) === 0 ? 'Buổi tập hiệu quả, cảm thấy khỏe.' : null,
            'created_at' => $startedAt,
            'updated_at' => $startedAt,
        ]);

        $elapsed = 0;
        foreach ($plan->planExercises as $pe) {
            $targetReps = WorkoutService::parseReps($pe->target_reps);
            $weight = $pe->target_weight ? round($pe->target_weight * max(0.8, $progress) / 2.5) * 2.5 : null;

            for ($n = 1; $n <= $pe->target_sets; $n++) {
                $elapsed += 60 + $pe->rest_seconds;
                $session->sets()->create([
                    'exercise_id' => $pe->exercise_id,
                    'set_number' => $n,
                    'target_reps' => $targetReps,
                    'actual_reps' => max(1, $targetReps - mt_rand(0, $n > 2 ? 2 : 1)),
                    'target_weight' => $pe->target_weight,
                    'actual_weight' => $weight,
                    'rpe' => min(10, 6.5 + $n * 0.5 + mt_rand(0, 1) * 0.5),
                    'rest_seconds' => $pe->rest_seconds,
                    'completed' => true,
                    'note' => $notes[mt_rand(0, count($notes) - 1)],
                    'completed_at' => $startedAt->copy()->addSeconds(min($elapsed, $duration)),
                    'created_at' => $startedAt,
                    'updated_at' => $startedAt,
                ]);
            }
        }
    }
}

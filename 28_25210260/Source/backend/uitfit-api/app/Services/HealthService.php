<?php

namespace App\Services;

use App\Models\HealthRecord;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class HealthService
{
    /** BMI = weight_kg / ((height_cm / 100) ^ 2), làm tròn 2 chữ số */
    public static function calculateBmi(float $weightKg, float $heightCm): float
    {
        $heightM = $heightCm / 100;

        return round($weightKg / ($heightM * $heightM), 2);
    }

    /** @return array{key: string, label: string}|null */
    public static function bmiCategory(?float $bmi): ?array
    {
        if (! $bmi) {
            return null;
        }

        return match (true) {
            $bmi < 18.5 => ['key' => 'underweight', 'label' => 'Thiếu cân'],
            $bmi < 25 => ['key' => 'normal', 'label' => 'Bình thường'],
            $bmi < 30 => ['key' => 'overweight', 'label' => 'Thừa cân'],
            default => ['key' => 'obese', 'label' => 'Béo phì'],
        };
    }

    public function store(User $user, array $data): HealthRecord
    {
        return DB::transaction(function () use ($user, $data) {
            // Không tin BMI từ client: luôn tính lại tại server
            $data['bmi'] = self::calculateBmi((float) $data['weight'], (float) $data['height']);
            unset($data['user_id']);

            $record = $user->healthRecords()->create($data);
            $this->syncProfile($user);

            return $record;
        });
    }

    public function delete(HealthRecord $record): void
    {
        DB::transaction(function () use ($record) {
            $user = $record->user;
            $record->delete();
            $this->syncProfile($user);
        });
    }

    public function latest(User $user): ?HealthRecord
    {
        return $user->healthRecords()->orderByDesc('record_date')->orderByDesc('id')->first();
    }

    /** Cân nặng / chiều cao trong hồ sơ luôn theo bản ghi chỉ số mới nhất */
    private function syncProfile(User $user): void
    {
        $latest = $this->latest($user);
        if (! $latest) {
            return;
        }
        $user->profile()->updateOrCreate(['user_id' => $user->id], [
            'current_weight' => $latest->weight,
            'height' => $latest->height,
        ]);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Giữ lịch sử khi lịch tập bị xóa: FK set null + lưu tên lịch tại thời điểm tập
            $table->foreignId('workout_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('plan_name', 150);
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->enum('status', ['in_progress', 'completed', 'cancelled'])->default('in_progress');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('workout_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->restrictOnDelete();
            $table->integer('set_number');
            $table->integer('target_reps')->nullable();
            $table->integer('actual_reps')->nullable();
            $table->decimal('target_weight', 6, 2)->nullable();
            $table->decimal('actual_weight', 6, 2)->nullable();
            $table->decimal('rpe', 3, 1)->nullable();
            $table->integer('rest_seconds')->default(60);
            $table->boolean('completed')->default(false);
            $table->string('note', 255)->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_sets');
        Schema::dropIfExists('workout_sessions');
    }
};

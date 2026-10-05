<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->integer('estimated_duration')->nullable(); // phút
            $table->string('difficulty', 30)->nullable();
            $table->enum('status', ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'])->default('draft');
            $table->timestamps();
        });

        Schema::create('workout_plan_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->restrictOnDelete();
            $table->integer('order_index');
            $table->integer('target_sets');
            $table->string('target_reps', 20);
            $table->decimal('target_weight', 6, 2)->nullable();
            $table->integer('rest_seconds')->default(60);
            $table->string('note', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_plan_exercises');
        Schema::dropIfExists('workout_plans');
    }
};

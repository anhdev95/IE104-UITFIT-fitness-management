<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->decimal('current_weight', 5, 2)->nullable();
            $table->enum('goal', ['lose_weight', 'gain_muscle', 'maintain', 'general_fitness'])->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};

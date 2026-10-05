<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('record_date');
            $table->decimal('weight', 5, 2);
            $table->decimal('height', 5, 2);
            $table->decimal('bmi', 5, 2);
            $table->decimal('body_fat', 5, 2)->nullable();
            $table->decimal('muscle_mass', 5, 2)->nullable();
            $table->decimal('waist', 5, 2)->nullable();
            $table->decimal('chest', 5, 2)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'record_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_records');
    }
};

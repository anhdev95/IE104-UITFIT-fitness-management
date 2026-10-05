<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 160)->unique();
            // chest | back | shoulders | legs | arms | core | cardio
            $table->string('muscle_group', 50)->index();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced']);
            $table->string('equipment', 100)->nullable();
            $table->text('description');
            // Mỗi bước hướng dẫn nằm trên một dòng
            $table->text('instructions');
            // Nhóm cơ tác động chi tiết, ví dụ: "Ngực giữa, Vai trước, Tay sau"
            $table->string('target_muscles', 255)->nullable();
            // Lưu ý khi tập
            $table->text('tips')->nullable();
            $table->string('image')->nullable();
            $table->string('video_url')->nullable();
            $table->integer('default_sets')->default(3);
            $table->string('default_reps', 20)->default('10-12');
            $table->integer('default_rest_seconds')->default(60);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};

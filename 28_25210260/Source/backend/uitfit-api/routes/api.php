<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ExerciseController as AdminExerciseController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\HealthRecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\WorkoutPlanController;
use App\Http\Controllers\WorkoutSessionController;
use App\Http\Controllers\WorkoutSetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| UITfit REST API — prefix /api
|--------------------------------------------------------------------------
*/

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/exercises', [ExerciseController::class, 'index']);
Route::get('/exercises/{exercise}', [ExerciseController::class, 'show']);

// User đã đăng nhập
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    Route::apiResource('health-records', HealthRecordController::class)->except('update');

    Route::apiResource('workout-plans', WorkoutPlanController::class);
    Route::post('/workout-plans/{workoutPlan}/start', [WorkoutPlanController::class, 'start']);

    Route::get('/workout-sessions/{workoutSession}', [WorkoutSessionController::class, 'show']);
    Route::post('/workout-sessions/{workoutSession}/sets', [WorkoutSetController::class, 'store']);
    Route::post('/workout-sessions/{workoutSession}/complete', [WorkoutSessionController::class, 'complete']);
    Route::post('/workout-sessions/{workoutSession}/cancel', [WorkoutSessionController::class, 'cancel']);
    Route::put('/workout-sets/{workoutSet}', [WorkoutSetController::class, 'update']);
    Route::delete('/workout-sets/{workoutSet}', [WorkoutSetController::class, 'destroy']);
    Route::get('/workout-history', [WorkoutSessionController::class, 'history']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/statistics/health', [StatisticsController::class, 'health']);
    Route::get('/statistics/workouts', [StatisticsController::class, 'workouts']);

    // Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/exercises', [AdminExerciseController::class, 'index']);
        Route::post('/exercises', [AdminExerciseController::class, 'store']);
        Route::get('/exercises/{exercise}', [AdminExerciseController::class, 'show']);
        Route::put('/exercises/{exercise}', [AdminExerciseController::class, 'update']);
        Route::delete('/exercises/{exercise}', [AdminExerciseController::class, 'destroy']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
    });
});

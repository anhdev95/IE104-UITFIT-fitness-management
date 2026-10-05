<?php

namespace App\Http\Controllers;

use App\Http\Requests\Workout\StoreWorkoutSetRequest;
use App\Http\Requests\Workout\UpdateWorkoutSetRequest;
use App\Http\Resources\WorkoutSetResource;
use App\Models\WorkoutSession;
use App\Models\WorkoutSet;
use App\Services\WorkoutService;

class WorkoutSetController extends Controller
{
    public function __construct(private WorkoutService $workouts) {}

    /** POST /api/workout-sessions/{id}/sets — thêm set mới */
    public function store(StoreWorkoutSetRequest $request, WorkoutSession $workoutSession)
    {
        $this->ensureOwner($workoutSession);
        $set = $this->workouts->addSet($workoutSession, $request->validated());

        return $this->success(new WorkoutSetResource($set), 'Đã thêm set', 201);
    }

    /** PUT /api/workout-sets/{id} — lưu reps/kg/RPE/note và tick hoàn thành */
    public function update(UpdateWorkoutSetRequest $request, WorkoutSet $workoutSet)
    {
        $this->ensureOwner($workoutSet->session);
        $set = $this->workouts->updateSet($workoutSet, $request->validated());

        return $this->success(new WorkoutSetResource($set), $set->completed ? 'Đã hoàn thành set' : 'Đã lưu set');
    }

    public function destroy(WorkoutSet $workoutSet)
    {
        $this->ensureOwner($workoutSet->session);
        $this->workouts->deleteSet($workoutSet);

        return $this->success(null, 'Đã xóa set');
    }
}

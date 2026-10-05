<?php

namespace App\Http\Controllers;

use App\Http\Requests\Workout\WorkoutPlanRequest;
use App\Http\Resources\WorkoutPlanResource;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\WorkoutPlan;
use App\Services\WorkoutService;
use Illuminate\Http\Request;

class WorkoutPlanController extends Controller
{
    public function __construct(private WorkoutService $workouts) {}

    /** GET /api/workout-plans?status=all|in_progress|completed|not_started&search= */
    public function index(Request $request)
    {
        $status = $request->input('status', 'all');

        $plans = $request->user()->workoutPlans()
            ->with(['planExercises', 'activeSession.sets'])
            ->when($status === 'in_progress', fn ($q) => $q->where('status', 'in_progress'))
            ->when($status === 'completed', fn ($q) => $q->where('status', 'completed'))
            ->when($status === 'not_started', fn ($q) => $q->whereIn('status', ['draft', 'scheduled', 'cancelled']))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->input('search').'%'))
            ->orderByRaw('scheduled_date IS NULL')
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id')
            ->get();

        return $this->success(WorkoutPlanResource::collection($plans));
    }

    public function store(WorkoutPlanRequest $request)
    {
        $plan = $this->workouts->createPlan($request->user(), $request->validated());

        return $this->success($this->resource($plan), 'Tạo lịch tập thành công', 201);
    }

    public function show(WorkoutPlan $workoutPlan)
    {
        $this->ensureOwner($workoutPlan);

        return $this->success($this->resource($workoutPlan));
    }

    public function update(WorkoutPlanRequest $request, WorkoutPlan $workoutPlan)
    {
        $this->ensureOwner($workoutPlan);
        $plan = $this->workouts->updatePlan($workoutPlan, $request->validated());

        return $this->success($this->resource($plan), 'Cập nhật lịch tập thành công');
    }

    public function destroy(WorkoutPlan $workoutPlan)
    {
        $this->ensureOwner($workoutPlan);
        $workoutPlan->delete();

        return $this->success(null, 'Đã xóa lịch tập');
    }

    /** POST /api/workout-plans/{id}/start */
    public function start(WorkoutPlan $workoutPlan)
    {
        $this->ensureOwner($workoutPlan);
        $session = $this->workouts->startSession($workoutPlan);
        $session->load(['plan.planExercises', 'sets.exercise']);

        return $this->success(
            (new WorkoutSessionResource($session))->detailed(),
            'Bắt đầu buổi tập',
            $session->wasRecentlyCreated ? 201 : 200
        );
    }

    private function resource(WorkoutPlan $plan): WorkoutPlanResource
    {
        return new WorkoutPlanResource($plan->fresh()->load(['planExercises.exercise', 'activeSession.sets']));
    }
}

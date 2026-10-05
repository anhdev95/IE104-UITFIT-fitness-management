<?php

namespace App\Http\Controllers;

use App\Http\Requests\Workout\CompleteSessionRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\WorkoutSession;
use App\Services\WorkoutService;
use Illuminate\Http\Request;

class WorkoutSessionController extends Controller
{
    public function __construct(private WorkoutService $workouts) {}

    public function show(WorkoutSession $workoutSession)
    {
        $this->ensureOwner($workoutSession);

        return $this->success($this->detail($workoutSession));
    }

    public function complete(CompleteSessionRequest $request, WorkoutSession $workoutSession)
    {
        $this->ensureOwner($workoutSession);
        $this->workouts->completeSession($workoutSession, $request->input('note'));

        return $this->success($this->detail($workoutSession), 'Chúc mừng! Bạn đã hoàn thành buổi tập');
    }

    public function cancel(WorkoutSession $workoutSession)
    {
        $this->ensureOwner($workoutSession);
        $this->workouts->cancelSession($workoutSession);

        return $this->success($this->detail($workoutSession), 'Đã hủy buổi tập');
    }

    /** GET /api/workout-history?from=&to=&status=&search= */
    public function history(Request $request)
    {
        $sessions = $request->user()->workoutSessions()
            ->with('sets')
            ->when($request->filled('from'), fn ($q) => $q->whereDate('started_at', '>=', $request->input('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('started_at', '<=', $request->input('to')))
            ->when($request->filled('status') && $request->input('status') !== 'all',
                fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('plan_name', 'like', '%'.$request->input('search').'%'))
            ->latest('started_at')
            ->get();

        return $this->success(WorkoutSessionResource::collection($sessions));
    }

    private function detail(WorkoutSession $session): WorkoutSessionResource
    {
        $session = $session->fresh()->load(['plan.planExercises', 'sets.exercise']);

        return (new WorkoutSessionResource($session))->detailed();
    }
}

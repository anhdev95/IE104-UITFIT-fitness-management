<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    /** GET /api/exercises?search=&muscle_group=&difficulty= */
    public function index(Request $request)
    {
        $exercises = Exercise::query()
            ->where('status', 'active')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->input('search').'%'))
            ->when($request->filled('muscle_group') && $request->input('muscle_group') !== 'all',
                fn ($q) => $q->where('muscle_group', $request->input('muscle_group')))
            ->when($request->filled('difficulty'), fn ($q) => $q->where('difficulty', $request->input('difficulty')))
            ->orderBy('muscle_group')
            ->orderBy('name')
            ->get();

        return $this->success(ExerciseResource::collection($exercises));
    }

    public function show(Exercise $exercise)
    {
        abort_if($exercise->status !== 'active', 404, 'Bài tập không tồn tại hoặc đã ngừng hoạt động.');

        return $this->success(new ExerciseResource($exercise));
    }
}

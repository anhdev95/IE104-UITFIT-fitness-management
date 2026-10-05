<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExerciseRequest;
use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExerciseController extends Controller
{
    /** GET /api/admin/exercises?search=&muscle_group=&difficulty=&status= */
    public function index(Request $request)
    {
        $exercises = Exercise::query()
            ->withCount('planExercises')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->input('search').'%'))
            ->when($request->filled('muscle_group') && $request->input('muscle_group') !== 'all',
                fn ($q) => $q->where('muscle_group', $request->input('muscle_group')))
            ->when($request->filled('difficulty'), fn ($q) => $q->where('difficulty', $request->input('difficulty')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->orderBy('id')
            ->get();

        return $this->success(ExerciseResource::collection($exercises));
    }

    public function show(Exercise $exercise)
    {
        return $this->success(new ExerciseResource($exercise));
    }

    public function store(ExerciseRequest $request)
    {
        $exercise = Exercise::create($this->payload($request));

        return $this->success(new ExerciseResource($exercise), 'Thêm bài tập thành công', 201);
    }

    public function update(ExerciseRequest $request, Exercise $exercise)
    {
        $exercise->update($this->payload($request, $exercise));

        return $this->success(new ExerciseResource($exercise->fresh()), 'Cập nhật bài tập thành công');
    }

    /**
     * Bài tập đã được dùng trong lịch tập / lịch sử thì không xóa cứng (giữ toàn vẹn dữ liệu),
     * chuyển sang trạng thái ngừng hoạt động.
     */
    public function destroy(Exercise $exercise)
    {
        if ($exercise->planExercises()->exists() || $exercise->workoutSets()->exists()) {
            $exercise->update(['status' => 'inactive']);

            return $this->success(new ExerciseResource($exercise),
                'Bài tập đã được sử dụng trong lịch tập nên được chuyển sang trạng thái ngừng hoạt động.');
        }

        $this->deleteStoredImage($exercise->image);
        $exercise->delete();

        return $this->success(null, 'Đã xóa bài tập');
    }

    private function payload(ExerciseRequest $request, ?Exercise $exercise = null): array
    {
        $data = collect($request->validated())->except('image_file')->all();
        $data['slug'] = $this->uniqueSlug($data['name'], $exercise?->id);
        $data['status'] = $data['status'] ?? 'active';

        if ($request->hasFile('image_file')) {
            $this->deleteStoredImage($exercise?->image);
            $data['image'] = $request->file('image_file')->store('exercises', 'public');
        }

        return $data;
    }

    private function uniqueSlug(string $name, ?int $ignoreId): string
    {
        $base = Str::slug($name) ?: 'exercise';
        $slug = $base;
        $i = 2;
        while (Exercise::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function deleteStoredImage(?string $path): void
    {
        if ($path && ! Str::startsWith($path, ['http://', 'https://', 'images/'])) {
            Storage::disk('public')->delete($path);
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\HealthRecordResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /** GET /api/admin/users?search=&role=&status= */
    public function index(Request $request)
    {
        $users = User::query()
            ->with('profile')
            ->withCount(['workoutPlans', 'workoutSessions'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->input('search').'%';
                $q->where(fn ($w) => $w->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->input('role')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->orderBy('id')
            ->get();

        return $this->success(UserResource::collection($users));
    }

    public function show(User $user)
    {
        $user->load('profile')->loadCount(['workoutPlans', 'workoutSessions', 'healthRecords']);
        $latestHealth = $user->healthRecords()->orderByDesc('record_date')->first();

        return $this->success([
            'user' => new UserResource($user),
            'latest_health' => $latestHealth ? new HealthRecordResource($latestHealth) : null,
            'completed_sessions' => $user->workoutSessions()->where('status', 'completed')->count(),
        ]);
    }

    /** PUT /api/admin/users/{id}/status — khóa / mở khóa */
    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 403, 'Bạn không thể tự khóa tài khoản của mình.');
        abort_if($user->isAdmin(), 403, 'Không thể khóa tài khoản quản trị viên.');

        $user->update(['status' => $request->input('status')]);
        if ($user->isLocked()) {
            // Thu hồi mọi token → user bị đăng xuất ngay
            $user->tokens()->delete();
        }

        return $this->success(
            new UserResource($user->load('profile')),
            $user->isLocked() ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản'
        );
    }
}

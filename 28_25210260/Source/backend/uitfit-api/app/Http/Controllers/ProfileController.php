<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\UploadAvatarRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return $this->success(new UserResource($request->user()->load('profile')));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        DB::transaction(function () use ($user, $data) {
            $user->update(['name' => $data['name']]);
            $user->profile()->updateOrCreate(['user_id' => $user->id], collect($data)->except('name')->all());
        });

        return $this->success(new UserResource($user->fresh()->load('profile')), 'Cập nhật hồ sơ thành công');
    }

    public function uploadAvatar(UploadAvatarRequest $request)
    {
        $user = $request->user();
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);

        if ($profile->avatar && ! str_starts_with($profile->avatar, 'http')) {
            Storage::disk('public')->delete($profile->avatar);
        }
        $profile->update(['avatar' => $request->file('avatar')->store('avatars', 'public')]);

        return $this->success(new UserResource($user->load('profile')), 'Cập nhật ảnh đại diện thành công');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        $user->update(['password' => Hash::make($request->input('password'))]);

        // Đăng xuất các thiết bị khác, giữ token hiện tại
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return $this->success(null, 'Đổi mật khẩu thành công');
    }
}

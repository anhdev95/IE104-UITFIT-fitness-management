<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Đăng ký tài khoản role user, tạo luôn hồ sơ trống và token đăng nhập.
     *
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => strtolower($data['email']),
                'password' => Hash::make($data['password']),
                'role' => User::ROLE_USER,
                'status' => User::STATUS_ACTIVE,
            ]);
            $user->profile()->create([]);

            return [
                'user' => $user->load('profile'),
                'token' => $user->createToken('uitfit-token')->plainTextToken,
            ];
        });
    }

    /**
     * @return array{user: User, token: string}
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', strtolower($email))->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không chính xác.'],
            ]);
        }

        abort_if($user->isLocked(), 403, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');

        return [
            'user' => $user->load('profile'),
            'token' => $user->createToken('uitfit-token')->plainTextToken,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}

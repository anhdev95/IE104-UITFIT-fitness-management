<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function register(RegisterRequest $request)
    {
        $result = $this->auth->register($request->validated());

        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 'Đăng ký tài khoản thành công', 201);
    }

    public function login(LoginRequest $request)
    {
        $result = $this->auth->login($request->input('email'), $request->input('password'));

        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 'Đăng nhập thành công');
    }

    public function logout(Request $request)
    {
        $this->auth->logout($request->user());

        return $this->success(null, 'Đăng xuất thành công');
    }

    public function me(Request $request)
    {
        return $this->success(new UserResource($request->user()->load('profile')));
    }
}

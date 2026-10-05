<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

abstract class Controller
{
    /**
     * Response thành công thống nhất: { success, message, data }
     */
    protected function success(mixed $data = null, string $message = 'Thành công', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Response lỗi thống nhất: { success, message, errors }
     */
    protected function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => (object) $errors,
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Kiểm tra ownership: dữ liệu phải thuộc về user đang đăng nhập, sai → 403.
     */
    protected function ensureOwner(Model $model, string $column = 'user_id'): void
    {
        abort_if((int) $model->{$column} !== (int) auth()->id(), 403, 'Bạn không có quyền truy cập dữ liệu này.');
    }
}

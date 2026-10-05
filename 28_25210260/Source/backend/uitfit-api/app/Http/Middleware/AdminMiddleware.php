<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Chức năng chỉ dành cho quản trị viên.',
                'errors' => (object) [],
            ], 403, [], JSON_UNESCAPED_UNICODE);
        }

        return $next($request);
    }
}

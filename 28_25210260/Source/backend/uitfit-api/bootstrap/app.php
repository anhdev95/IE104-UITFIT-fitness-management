<?php

use App\Http\Middleware\AdminMiddleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Chuẩn hóa mọi lỗi API về dạng { success: false, message, errors }
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $json = fn (string $message, int $status, array $errors = []) => response()->json([
                'success' => false,
                'message' => $message,
                'errors' => (object) $errors,
            ], $status, [], JSON_UNESCAPED_UNICODE);

            if ($e instanceof ValidationException) {
                return $json('Dữ liệu không hợp lệ', 422, $e->errors());
            }
            if ($e instanceof AuthenticationException) {
                return $json('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.', 401);
            }
            if ($e instanceof ModelNotFoundException
                || ($e instanceof NotFoundHttpException && $e->getPrevious() instanceof ModelNotFoundException)) {
                return $json('Không tìm thấy dữ liệu yêu cầu.', 404);
            }
            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $defaults = [
                    400 => 'Yêu cầu không hợp lệ.',
                    403 => 'Bạn không có quyền thực hiện thao tác này.',
                    404 => 'Không tìm thấy tài nguyên yêu cầu.',
                    405 => 'Phương thức không được hỗ trợ.',
                    429 => 'Bạn thao tác quá nhanh, vui lòng thử lại sau.',
                ];
                $message = $e->getMessage() ?: ($defaults[$status] ?? 'Đã xảy ra lỗi.');
                if ($status === 404 && str_contains($message, 'could not be found')) {
                    $message = $defaults[404];
                }

                return $json($message, $status);
            }

            report($e);

            return $json(
                config('app.debug') ? $e->getMessage() : 'Lỗi máy chủ, vui lòng thử lại sau.',
                500
            );
        });
    })->create();

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { firstError, SILENT_ERROR, toApiError } from '../services/api.helpers';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * - Gắn header Authorization: Bearer <TOKEN> cho mọi request API
 * - Xử lý lỗi chung 400/401/403/404/422/500 → toast tiếng Việt
 * - 401 → xóa phiên và chuyển về trang đăng nhập
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  const token = auth.token;
  const request = req.clone({
    setHeaders: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return next(request).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const apiError = toApiError(err);
        const isAuthRequest = /\/(login|register)$/.test(req.url);

        if (err.status === 401 && !isAuthRequest) {
          auth.clearSession();
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          toast.warning(apiError.message);
        } else if (!req.context.get(SILENT_ERROR)) {
          // 422: component hiển thị lỗi từng field, toast chỉ báo lỗi đầu tiên
          toast.error(err.status === 422 ? firstError(apiError) : apiError.message);
        }
        return throwError(() => apiError);
      }
      return throwError(() => err);
    }),
  );
};

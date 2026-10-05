import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Chỉ cho phép user đã đăng nhập */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Trang user (dashboard, lịch tập...) — admin được chuyển về khu vực admin */
export const userOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin() ? router.createUrlTree(['/admin/dashboard']) : true;
};

/** Trang login/register: đã đăng nhập thì về trang chủ theo vai trò */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree([auth.homeUrl()]) : true;
};

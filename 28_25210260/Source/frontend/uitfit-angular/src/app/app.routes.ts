import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard, guestGuard, userOnlyGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';

export const routes: Routes = [
  // 1. Landing – Guest
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', title: 'UITfit – Sống khỏe mỗi ngày', loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent) },
    ],
  },

  // 2–3. Đăng ký / Đăng nhập
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', title: 'Đăng nhập – UITfit', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: 'register', title: 'Đăng ký – UITfit', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
    ],
  },

  // 4–14. Khu vực người dùng
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [authGuard, userOnlyGuard],
    children: [
      { path: 'dashboard', title: 'Dashboard – UITfit', data: { title: 'Dashboard' }, loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'profile', title: 'Hồ sơ – UITfit', data: { title: 'Hồ sơ cá nhân' }, loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'health', title: 'Chỉ số sức khỏe – UITfit', data: { title: 'Cập nhật chỉ số cơ thể' }, loadComponent: () => import('./features/health/health-form/health-form.component').then((m) => m.HealthFormComponent) },
      { path: 'progress', title: 'Tiến trình – UITfit', data: { title: 'Tiến trình sức khỏe' }, loadComponent: () => import('./features/health/health-progress/health-progress.component').then((m) => m.HealthProgressComponent) },
      { path: 'exercises', title: 'Thư viện bài tập – UITfit', data: { title: 'Thư viện bài tập' }, loadComponent: () => import('./features/exercises/exercise-list/exercise-list.component').then((m) => m.ExerciseListComponent) },
      { path: 'exercises/:id', title: 'Chi tiết bài tập – UITfit', data: { title: 'Chi tiết bài tập' }, loadComponent: () => import('./features/exercises/exercise-detail/exercise-detail.component').then((m) => m.ExerciseDetailComponent) },
      { path: 'workouts', title: 'Lịch tập – UITfit', data: { title: 'Lịch tập của tôi' }, loadComponent: () => import('./features/workouts/workout-list/workout-list.component').then((m) => m.WorkoutListComponent) },
      { path: 'workouts/create', title: 'Tạo lịch tập – UITfit', data: { title: 'Tạo lịch tập' }, loadComponent: () => import('./features/workouts/workout-form/workout-form.component').then((m) => m.WorkoutFormComponent) },
      { path: 'workouts/:id/edit', title: 'Sửa lịch tập – UITfit', data: { title: 'Chỉnh sửa lịch tập' }, loadComponent: () => import('./features/workouts/workout-form/workout-form.component').then((m) => m.WorkoutFormComponent) },
      { path: 'workouts/:id', title: 'Chi tiết lịch tập – UITfit', data: { title: 'Chi tiết lịch tập' }, loadComponent: () => import('./features/workouts/workout-detail/workout-detail.component').then((m) => m.WorkoutDetailComponent) },
      { path: 'workout-session/:id', title: 'Buổi tập – UITfit', data: { title: 'Thực hiện buổi tập' }, loadComponent: () => import('./features/workouts/workout-session/workout-session.component').then((m) => m.WorkoutSessionComponent) },
      { path: 'history', title: 'Lịch sử tập luyện – UITfit', data: { title: 'Lịch sử tập luyện' }, loadComponent: () => import('./features/workouts/workout-history/workout-history.component').then((m) => m.WorkoutHistoryComponent) },
      { path: 'history/:id', title: 'Chi tiết buổi tập – UITfit', data: { title: 'Chi tiết lịch sử' }, loadComponent: () => import('./features/workouts/workout-history-detail/workout-history-detail.component').then((m) => m.WorkoutHistoryDetailComponent) },
    ],
  },

  // 15–18. Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', title: 'Admin Dashboard – UITfit', data: { title: 'Admin Dashboard' }, loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'exercises', title: 'Quản lý bài tập – UITfit', data: { title: 'Quản lý bài tập' }, loadComponent: () => import('./features/admin/exercises/exercise-admin-list/exercise-admin-list.component').then((m) => m.ExerciseAdminListComponent) },
      { path: 'exercises/create', title: 'Thêm bài tập – UITfit', data: { title: 'Thêm bài tập' }, loadComponent: () => import('./features/admin/exercises/exercise-admin-form/exercise-admin-form.component').then((m) => m.ExerciseAdminFormComponent) },
      { path: 'exercises/:id/edit', title: 'Sửa bài tập – UITfit', data: { title: 'Sửa bài tập' }, loadComponent: () => import('./features/admin/exercises/exercise-admin-form/exercise-admin-form.component').then((m) => m.ExerciseAdminFormComponent) },
      { path: 'users', title: 'Quản lý người dùng – UITfit', data: { title: 'Quản lý người dùng' }, loadComponent: () => import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent) },
    ],
  },

  { path: '**', redirectTo: '' },
];

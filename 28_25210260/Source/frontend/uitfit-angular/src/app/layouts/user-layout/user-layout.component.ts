import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MenuItem, SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { pageTitleSignal } from '../page-title';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-shell">
      <app-sidebar [items]="menu" [open]="menuOpen()" homeLink="/dashboard"
        (navigate)="menuOpen.set(false)" (logout)="auth.logout()" />
      @if (menuOpen()) { <div class="sidebar-backdrop" (click)="menuOpen.set(false)"></div> }
      <div class="app-main">
        <app-header [title]="title()" (toggleMenu)="menuOpen.set(!menuOpen())" (logout)="auth.logout()" />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class UserLayoutComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly title = pageTitleSignal();

  readonly menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-grid-1x2', link: '/dashboard' },
    {
      label: 'Lịch tập', icon: 'bi-calendar-week', children: [
        { label: 'Lịch tập của tôi', icon: 'bi-calendar2-check', link: '/workouts' },
        { label: 'Lịch sử tập luyện', icon: 'bi-clock-history', link: '/history' },
      ],
    },
    {
      label: 'Bài tập', icon: 'bi-collection', children: [
        { label: 'Thư viện bài tập', icon: 'bi-journal-bookmark', link: '/exercises' },
      ],
    },
    { label: 'Chỉ số sức khỏe', icon: 'bi-heart-pulse', link: '/health' },
    { label: 'Tiến trình', icon: 'bi-graph-up-arrow', link: '/progress' },
    { label: 'Hồ sơ cá nhân', icon: 'bi-person-circle', link: '/profile' },
  ];
}

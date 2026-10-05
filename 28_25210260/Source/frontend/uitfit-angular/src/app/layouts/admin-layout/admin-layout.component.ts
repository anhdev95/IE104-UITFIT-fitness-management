import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MenuItem, SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { pageTitleSignal } from '../page-title';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-shell admin-shell">
      <app-sidebar brand="Admin UITfit" [items]="menu" [open]="menuOpen()" homeLink="/admin/dashboard"
        (navigate)="menuOpen.set(false)" (logout)="auth.logout()" />
      @if (menuOpen()) { <div class="sidebar-backdrop" (click)="menuOpen.set(false)"></div> }
      <div class="app-main">
        <app-header [title]="title()" subtitle="Khu vực quản trị" (toggleMenu)="menuOpen.set(!menuOpen())"
          (logout)="auth.logout()" />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly title = pageTitleSignal();

  readonly menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', link: '/admin/dashboard' },
    { label: 'Quản lý bài tập', icon: 'bi-collection', link: '/admin/exercises' },
    { label: 'Quản lý người dùng', icon: 'bi-people', link: '/admin/users' },
  ];
}

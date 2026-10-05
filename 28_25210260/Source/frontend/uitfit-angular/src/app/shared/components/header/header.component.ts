import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LabelPipe } from '../../pipes/label.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LabelPipe],
  template: `
    <header class="top-header">
      <button type="button" class="btn btn-icon d-lg-none" aria-label="Mở menu" (click)="toggleMenu.emit()">
        <i class="bi bi-list fs-4"></i>
      </button>
      <div class="header-title">
        <h1>{{ title() }}</h1>
        @if (subtitle()) { <small>{{ subtitle() }}</small> }
      </div>
      <div class="ms-auto position-relative">
        <button type="button" class="user-chip" (click)="menuOpen.set(!menuOpen())">
          @if (auth.user()?.avatar_url) {
            <img [src]="auth.user()!.avatar_url" alt="avatar" class="avatar avatar-sm" />
          } @else {
            <span class="avatar avatar-sm avatar-initial">{{ initials() }}</span>
          }
          <span class="d-none d-md-flex flex-column text-start lh-sm">
            <strong>{{ auth.user()?.name }}</strong>
            <small class="text-muted">{{ auth.user()?.role | label: 'role' }}</small>
          </span>
          <i class="bi bi-chevron-down small text-muted"></i>
        </button>
        @if (menuOpen()) {
          <div class="dropdown-backdrop" (click)="menuOpen.set(false)"></div>
          <div class="user-dropdown">
            @if (!auth.isAdmin()) {
              <a routerLink="/profile" class="dropdown-item" (click)="menuOpen.set(false)">
                <i class="bi bi-person me-2"></i>Hồ sơ cá nhân
              </a>
            }
            <button type="button" class="dropdown-item text-danger" (click)="menuOpen.set(false); logout.emit()">
              <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly title = input('');
  readonly subtitle = input('');
  readonly toggleMenu = output<void>();
  readonly logout = output<void>();
  readonly menuOpen = signal(false);

  readonly initials = computed(() =>
    (this.auth.user()?.name ?? 'U')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0])
      .join('')
      .toUpperCase(),
  );
}

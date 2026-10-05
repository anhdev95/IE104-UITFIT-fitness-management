import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  exact?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="open()">
      <a class="sidebar-brand" [routerLink]="homeLink()">
        <span class="brand-logo"><i class="bi bi-lightning-charge-fill"></i></span>
        <span>{{ brand() }}</span>
      </a>
      <nav class="sidebar-nav">
        @for (item of items(); track item.label) {
          @if (item.children) {
            <div class="nav-group-label">
              @if (item.icon) { <i class="bi" [class]="item.icon"></i> }
              {{ item.label }}
            </div>
            @for (child of item.children; track child.label) {
              <a class="nav-item-link nav-child" [routerLink]="child.link" routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: !!child.exact }" (click)="navigate.emit()">
                <i class="bi" [class]="child.icon ?? 'bi-dot'"></i>{{ child.label }}
              </a>
            }
          } @else {
            <a class="nav-item-link" [routerLink]="item.link" routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: !!item.exact }" (click)="navigate.emit()">
              <i class="bi" [class]="item.icon"></i>{{ item.label }}
            </a>
          }
        }
      </nav>
      <div class="sidebar-footer">
        <button type="button" class="nav-item-link w-100 border-0 bg-transparent" (click)="logout.emit()">
          <i class="bi bi-box-arrow-left"></i>Đăng xuất
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly items = input.required<MenuItem[]>();
  readonly brand = input('UITfit');
  readonly homeLink = input('/dashboard');
  readonly open = input(false);
  readonly navigate = output<void>();
  readonly logout = output<void>();
}

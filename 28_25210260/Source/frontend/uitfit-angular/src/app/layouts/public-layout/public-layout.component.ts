import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="public-nav">
      <div class="container d-flex align-items-center">
        <a routerLink="/" class="sidebar-brand p-0 me-4">
          <span class="brand-logo"><i class="bi bi-lightning-charge-fill"></i></span><span>UITfit</span>
        </a>
        <button class="btn btn-icon d-lg-none ms-auto" type="button" (click)="open.set(!open())" aria-label="Menu">
          <i class="bi bi-list fs-4"></i>
        </button>
        <div class="public-links" [class.open]="open()">
          <a routerLink="/" fragment="top" (click)="open.set(false)">Trang chủ</a>
          <a routerLink="/" fragment="exercises" (click)="open.set(false)">Bài tập</a>
          <a routerLink="/" fragment="features" (click)="open.set(false)">Tính năng</a>
          <a routerLink="/" fragment="about" (click)="open.set(false)">Về chúng tôi</a>
          <span class="flex-grow-1"></span>
          @if (auth.isLoggedIn()) {
            <a class="btn btn-primary" [routerLink]="auth.homeUrl()">Vào ứng dụng</a>
          } @else {
            <a class="btn btn-light" routerLink="/login">Đăng nhập</a>
            <a class="btn btn-primary" routerLink="/register">Đăng ký</a>
          }
        </div>
      </div>
    </nav>
    <router-outlet />
    <footer class="public-footer" id="about">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-5">
            <div class="sidebar-brand p-0 mb-2 text-white">
              <span class="brand-logo"><i class="bi bi-lightning-charge-fill"></i></span><span>UITfit</span>
            </div>
            <p class="mb-0 opacity-75">Website quản lý lịch tập và theo dõi sức khỏe cá nhân. Đồ án môn IE104 – Internet và Công nghệ Web, Trường ĐH Công nghệ Thông tin – ĐHQG TP.HCM.</p>
          </div>
          <div class="col-md-4">
            <h6>Về chúng tôi</h6>
            <p class="mb-1 opacity-75">Nhóm 28 – Lớp IE104.F31.CN1.CNTT</p>
            <p class="mb-1 opacity-75">MSSV: 25210260</p>
            <p class="mb-0 opacity-75">GVHD: Mai Xuân Hùng</p>
          </div>
          <div class="col-md-3">
            <h6>Công nghệ</h6>
            <p class="mb-0 opacity-75">Angular · Laravel · MySQL</p>
          </div>
        </div>
        <hr class="opacity-25" />
        <small class="opacity-75">© 2026 UITfit – Sống khỏe mỗi ngày.</small>
      </div>
    </footer>
  `,
})
export class PublicLayoutComponent {
  readonly auth = inject(AuthService);
  readonly open = signal(false);
}

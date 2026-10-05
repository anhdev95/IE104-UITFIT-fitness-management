import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="auth-wrapper">
      <section class="auth-brand">
        <a routerLink="/" class="sidebar-brand p-0 text-white">
          <span class="brand-logo"><i class="bi bi-lightning-charge-fill"></i></span><span>UITfit</span>
        </a>
        <div class="auth-brand-body">
          <img src="images/auth-illustration.svg" alt="UITfit" class="auth-illustration" />
          <h2>Quản lý lịch tập.<br />Theo dõi sức khỏe.</h2>
          <p>Ghi nhận từng set, đếm ngược thời gian nghỉ và xem tiến trình của bạn mỗi ngày.</p>
          <ul class="auth-points">
            <li><i class="bi bi-check-circle-fill"></i> Thư viện hơn 20 bài tập theo nhóm cơ</li>
            <li><i class="bi bi-check-circle-fill"></i> Ghi reps, kg, RPE cho từng set</li>
            <li><i class="bi bi-check-circle-fill"></i> Biểu đồ cân nặng, BMI trực quan</li>
          </ul>
        </div>
        <small class="opacity-75">© 2026 UITfit · Nhóm 28 · IE104</small>
      </section>
      <section class="auth-form-side">
        <div class="auth-card">
          <router-outlet />
        </div>
      </section>
    </div>
  `,
})
export class AuthLayoutComponent {}

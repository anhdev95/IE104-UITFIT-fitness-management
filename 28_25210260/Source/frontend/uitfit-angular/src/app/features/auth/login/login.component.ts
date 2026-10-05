import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true],
  });

  /** Điền nhanh tài khoản demo */
  fillDemo(role: 'user' | 'admin'): void {
    this.form.patchValue({ email: `${role}@uitfit.com`, password: '123456' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    const { email, password, remember } = this.form.getRawValue();

    this.auth.login(email, password, remember).subscribe({
      next: (res) => {
        this.toast.success(`Xin chào, ${res.user.name}!`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const home = res.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        const allowed = returnUrl && (res.user.role === 'admin') === returnUrl.startsWith('/admin');
        this.router.navigateByUrl(allowed ? returnUrl : home);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.errorMessage.set(err.errors?.['email']?.[0] ?? err.message);
      },
    });
  }
}

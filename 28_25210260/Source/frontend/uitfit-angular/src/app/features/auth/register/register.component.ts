import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { applyServerErrors, matchValidator } from '../../../shared/form-utils';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: matchValidator('password', 'password_confirmation') },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Đăng ký thành công! Hãy cập nhật hồ sơ để bắt đầu.');
        this.router.navigate(['/dashboard']);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.status === 422) applyServerErrors(this.form, err);
      },
    });
  }
}

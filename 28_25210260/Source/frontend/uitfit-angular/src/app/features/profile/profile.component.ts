import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '../../core/models/api-response.model';
import { Gender, Goal, ProfilePayload, User } from '../../core/models/user.model';
import { HealthService } from '../../core/services/health.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { applyServerErrors, emptyToNull, matchValidator } from '../../shared/form-utils';
import { LabelPipe, optionsOf } from '../../shared/pipes/label.pipe';
import { NumPipe } from '../../shared/pipes/num.pipe';

@Component({
  selector: 'app-profile',
  imports: [NumPipe, ReactiveFormsModule, DatePipe, DecimalPipe, LabelPipe, FieldErrorComponent, LoadingComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly savingPassword = signal(false);
  readonly uploading = signal(false);

  readonly genders = optionsOf('gender');
  readonly goals = optionsOf('goal');

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    gender: [null as Gender | null],
    date_of_birth: [null as string | null],
    height: [null as number | null, [Validators.min(100), Validators.max(250)]],
    current_weight: [null as number | null, [Validators.min(30), Validators.max(300)]],
    goal: [null as Goal | null],
    bio: [null as string | null, [Validators.maxLength(1000)]],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      current_password: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
    },
    { validators: matchValidator('password', 'password_confirmation') },
  );

  readonly bmi = computed(() => {
    const p = this.user()?.profile;
    return HealthService.previewBmi(p?.current_weight ?? null, p?.height ?? null);
  });

  readonly initials = computed(() =>
    (this.user()?.name ?? 'U').split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase(),
  );

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (u) => {
        this.setUser(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.profileService.updateProfile(emptyToNull(this.form.getRawValue()) as ProfilePayload).subscribe({
      next: (u) => {
        this.setUser(u);
        this.saving.set(false);
        this.toast.success('Cập nhật hồ sơ thành công');
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        if (err.status === 422) applyServerErrors(this.form, err);
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    this.profileService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: (res) => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toast.success(res.message);
      },
      error: (err: ApiError) => {
        this.savingPassword.set(false);
        if (err.status === 422) applyServerErrors(this.passwordForm, err);
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Ảnh đại diện tối đa 2MB.');
      return;
    }
    this.uploading.set(true);
    this.profileService.uploadAvatar(file).subscribe({
      next: (u) => {
        this.user.set(u);
        this.uploading.set(false);
        this.toast.success('Đã cập nhật ảnh đại diện');
      },
      error: () => this.uploading.set(false),
    });
  }

  private setUser(u: User): void {
    this.user.set(u);
    const p = u.profile;
    this.form.reset({
      name: u.name,
      gender: p?.gender ?? null,
      date_of_birth: p?.date_of_birth ?? null,
      height: p?.height ?? null,
      current_weight: p?.current_weight ?? null,
      goal: p?.goal ?? null,
      bio: p?.bio ?? null,
    });
  }
}

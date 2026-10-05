import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../../core/models/api-response.model';
import { HealthRecord, HealthRecordPayload } from '../../../core/models/health-record.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { HealthService } from '../../../core/services/health.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { applyServerErrors, emptyToNull, todayIso } from '../../../shared/form-utils';
import { NumPipe } from '../../../shared/pipes/num.pipe';

@Component({
  selector: 'app-health-form',
  imports: [NumPipe, ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe, FieldErrorComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './health-form.component.html',
})
export class HealthFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private healthService = inject(HealthService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  readonly records = signal<HealthRecord[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly today = todayIso();

  readonly form = this.fb.group({
    record_date: [todayIso(), Validators.required],
    weight: [null as number | null, [Validators.required, Validators.min(30), Validators.max(300)]],
    height: [this.auth.user()?.profile?.height ?? (null as number | null), [Validators.required, Validators.min(100), Validators.max(250)]],
    waist: [null as number | null, [Validators.min(30), Validators.max(250)]],
    chest: [null as number | null, [Validators.min(30), Validators.max(250)]],
    body_fat: [null as number | null, [Validators.min(1), Validators.max(70)]],
    muscle_mass: [null as number | null, [Validators.min(1), Validators.max(200)]],
    note: [null as string | null, Validators.maxLength(1000)],
  });

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  /** BMI preview phía client — chỉ để hiển thị, Laravel sẽ tính lại khi lưu */
  readonly bmiPreview = computed(() => {
    const v = this.formValue();
    return HealthService.previewBmi(Number(v.weight) || null, Number(v.height) || null);
  });
  readonly bmiCategory = computed(() => HealthService.bmiCategory(this.bmiPreview()));
  /** Vị trí kim trên thang BMI 15 → 35 */
  readonly bmiPosition = computed(() => {
    const bmi = this.bmiPreview();
    return bmi ? Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100)) : 0;
  });

  readonly latest = computed(() => this.records()[0] ?? null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.healthService.getRecords().subscribe({
      next: (list) => {
        this.records.set(list);
        this.loading.set(false);
        const last = list[0];
        if (last && !this.form.controls.height.value) this.form.patchValue({ height: last.height });
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.healthService.createRecord(emptyToNull(this.form.getRawValue()) as HealthRecordPayload).subscribe({
      next: (record) => {
        this.saving.set(false);
        this.toast.success(`Đã lưu chỉ số. BMI của bạn: ${record.bmi} (${record.bmi_category?.label})`);
        this.form.reset({ record_date: todayIso(), height: record.height });
        this.load();
        this.auth.me().subscribe();
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        if (err.status === 422) applyServerErrors(this.form, err);
      },
    });
  }

  async remove(record: HealthRecord): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Xóa bản ghi chỉ số?',
      message: `Bản ghi ngày ${record.record_date} sẽ bị xóa vĩnh viễn.`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    this.healthService.deleteRecord(record.id).subscribe(() => {
      this.toast.success('Đã xóa bản ghi');
      this.load();
    });
  }
}

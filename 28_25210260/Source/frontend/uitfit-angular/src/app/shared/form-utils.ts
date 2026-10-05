import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { take } from 'rxjs';
import { ApiError } from '../core/models/api-response.model';

/** Gắn lỗi validate từ Laravel (422) vào từng control của form: errors.server */
export function applyServerErrors(form: FormGroup, error: ApiError): void {
  for (const [field, messages] of Object.entries(error.errors ?? {})) {
    const control = form.get(field.replace(/\.(\d+)\./g, '.$1.'));
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: messages[0] });
      control.markAsTouched();
      // Người dùng sửa lại giá trị → bỏ lỗi server, chạy lại validator client
      control.valueChanges.pipe(take(1)).subscribe(() => control.updateValueAndValidity({ emitEvent: false }));
    }
  }
}

/** Validator: hai field phải trùng nhau (mật khẩu / xác nhận) */
export function matchValidator(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(field)?.value;
    const b = group.get(confirmField)?.value;
    return a && b && a !== b ? { mismatch: true } : null;
  };
}

/** Thông báo lỗi tiếng Việt cho một control */
export function controlError(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['server']) return e['server'];
  if (e['required']) return 'Trường này là bắt buộc.';
  if (e['requiredTrue']) return 'Bạn cần đồng ý để tiếp tục.';
  if (e['email']) return 'Email không hợp lệ.';
  if (e['minlength']) return `Tối thiểu ${e['minlength'].requiredLength} ký tự.`;
  if (e['maxlength']) return `Tối đa ${e['maxlength'].requiredLength} ký tự.`;
  if (e['min']) return `Giá trị nhỏ nhất là ${e['min'].min}.`;
  if (e['max']) return `Giá trị lớn nhất là ${e['max'].max}.`;
  if (e['pattern']) return 'Giá trị không đúng định dạng.';
  return 'Giá trị không hợp lệ.';
}

/** yyyy-MM-dd theo giờ địa phương */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Chuyển '' → null cho các field số / chuỗi tùy chọn trước khi gửi API */
export function emptyToNull<T extends object>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) out[k] = v === '' || v === undefined ? null : v;
  return out as T;
}

/** '2026-10-05' → '05/10' (nhãn trục biểu đồ) */
export function dayMonth(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

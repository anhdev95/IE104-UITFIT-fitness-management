import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'success' | 'warning';
  icon?: string;
  /** Nếu có: hiển thị ô nhập (vd: ghi chú khi hoàn thành buổi tập) */
  inputLabel?: string;
  inputPlaceholder?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: { confirmed: boolean; value: string }) => void;
}

/** Hộp thoại xác nhận dùng chung (xóa lịch tập, hoàn thành buổi tập, khóa user, ...) */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return this.open(options).then((r) => r.confirmed);
  }

  /** Xác nhận kèm ô nhập. Trả về null nếu hủy. */
  prompt(options: ConfirmOptions): Promise<string | null> {
    return this.open(options).then((r) => (r.confirmed ? r.value : null));
  }

  close(confirmed: boolean, value = ''): void {
    const current = this.state();
    if (!current) return;
    this.state.set(null);
    current.resolve({ confirmed, value });
  }

  private open(options: ConfirmOptions): Promise<{ confirmed: boolean; value: string }> {
    this.state()?.resolve({ confirmed: false, value: '' });
    return new Promise((resolve) => this.state.set({ ...options, resolve }));
  }
}

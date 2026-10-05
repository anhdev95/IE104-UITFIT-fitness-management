import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.show('success', message); }
  error(message: string) { this.show('error', message, 5000); }
  warning(message: string) { this.show('warning', message); }
  info(message: string) { this.show('info', message); }

  show(type: ToastType, message: string, timeout = 3500): void {
    const toast = { id: ++this.seq, type, message };
    // Không hiện trùng cùng một thông báo liên tiếp
    if (this.toasts().some((t) => t.message === message)) return;
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), timeout);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

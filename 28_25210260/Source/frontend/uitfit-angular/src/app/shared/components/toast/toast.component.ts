import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-stack">
      @for (t of toast.toasts(); track t.id) {
        <div class="app-toast" [class]="'app-toast app-toast-' + t.type" role="alert">
          <i class="bi" [class]="icons[t.type]"></i>
          <span class="flex-grow-1">{{ t.message }}</span>
          <button type="button" class="btn-close btn-close-sm" aria-label="Đóng" (click)="toast.dismiss(t.id)"></button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
  readonly icons: Record<string, string> = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  };
}

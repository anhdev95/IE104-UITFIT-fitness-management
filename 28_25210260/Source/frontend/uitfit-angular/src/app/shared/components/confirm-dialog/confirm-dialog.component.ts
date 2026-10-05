import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [FormsModule],
  template: `
    @if (confirm.state(); as s) {
      <div class="modal-backdrop-custom" (click)="confirm.close(false)"></div>
      <div class="confirm-dialog" role="dialog" aria-modal="true">
        <div class="confirm-icon" [class]="'confirm-icon confirm-' + (s.variant ?? 'primary')">
          <i class="bi" [class]="s.icon ?? defaultIcon[s.variant ?? 'primary']"></i>
        </div>
        <h5 class="mb-2">{{ s.title }}</h5>
        <p class="text-muted mb-3">{{ s.message }}</p>
        @if (s.inputLabel) {
          <div class="text-start mb-3">
            <label class="form-label small fw-semibold" for="confirm-input">{{ s.inputLabel }}</label>
            <textarea id="confirm-input" class="form-control" rows="3" [placeholder]="s.inputPlaceholder ?? ''"
              [(ngModel)]="value"></textarea>
          </div>
        }
        <div class="d-flex gap-2 justify-content-center">
          <button type="button" class="btn btn-light px-4" (click)="confirm.close(false)">{{ s.cancelText ?? 'Hủy' }}</button>
          <button type="button" class="btn px-4" [class]="'btn px-4 btn-' + (s.variant ?? 'primary')"
            (click)="confirm.close(true, value())">{{ s.confirmText ?? 'Xác nhận' }}</button>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);
  readonly value = signal('');
  readonly defaultIcon: Record<string, string> = {
    primary: 'bi-question-circle',
    danger: 'bi-trash3',
    success: 'bi-check2-circle',
    warning: 'bi-exclamation-triangle',
  };

  constructor() {
    // Reset ô nhập mỗi lần mở dialog
    effect(() => {
      if (this.confirm.state()) this.value.set('');
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.confirm.close(false);
  }
}

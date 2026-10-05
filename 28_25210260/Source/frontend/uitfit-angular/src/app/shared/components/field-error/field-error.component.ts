import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { controlError } from '../../form-utils';

/** Hiển thị lỗi validate của một form control (client + server) */
@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as msg) {
      <div class="invalid-feedback d-block">{{ msg }}</div>
    }
  `,
})
export class FieldErrorComponent {
  readonly control = input<AbstractControl | null>(null);
  message(): string | null {
    return controlError(this.control());
  }
}

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-state" [class.loading-inline]="inline()">
      <div class="spinner-border text-primary" role="status"></div>
      <span>{{ text() }}</span>
    </div>
  `,
})
export class LoadingComponent {
  readonly text = input('Đang tải dữ liệu...');
  readonly inline = input(false);
}

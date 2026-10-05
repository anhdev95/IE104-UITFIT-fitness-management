import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-icon"><i class="bi" [class]="icon()"></i></div>
      <h5>{{ title() }}</h5>
      @if (message()) {
        <p class="text-muted mb-3">{{ message() }}</p>
      }
      @if (actionLabel()) {
        @if (actionLink()) {
          <a class="btn btn-primary" [routerLink]="actionLink()" [queryParams]="actionQuery()">
            <i class="bi bi-plus-lg me-1"></i>{{ actionLabel() }}
          </a>
        } @else {
          <button class="btn btn-primary" type="button" (click)="action.emit()">{{ actionLabel() }}</button>
        }
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('bi-inbox');
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionLink = input<string | null>(null);
  readonly actionQuery = input<Record<string, unknown> | null>(null);
  readonly action = output<void>();
}

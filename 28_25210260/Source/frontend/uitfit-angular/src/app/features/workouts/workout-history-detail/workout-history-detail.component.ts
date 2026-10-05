import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutSession } from '../../../core/models/workout-session.model';
import { WorkoutService } from '../../../core/services/workout.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { BadgePipe, LabelPipe } from '../../../shared/pipes/label.pipe';
import { NumPipe } from '../../../shared/pipes/num.pipe';

@Component({
  selector: 'app-workout-history-detail',
  imports: [NumPipe, RouterLink, DatePipe, DecimalPipe, DurationPipe, LabelPipe, BadgePipe, LoadingComponent, EmptyStateComponent, ImgFallbackDirective],
  templateUrl: './workout-history-detail.component.html',
})
export class WorkoutHistoryDetailComponent implements OnInit {
  readonly id = input.required<string>();
  private workoutService = inject(WorkoutService);

  readonly session = signal<WorkoutSession | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.workoutService.getSession(Number(this.id())).subscribe({
      next: (s) => {
        this.session.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HistoryFilter, WorkoutSession } from '../../../core/models/workout-session.model';
import { WorkoutService } from '../../../core/services/workout.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { BadgePipe, LabelPipe, optionsOf } from '../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-workout-history',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, DurationPipe, LabelPipe, BadgePipe, LoadingComponent, EmptyStateComponent],
  templateUrl: './workout-history.component.html',
})
export class WorkoutHistoryComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  readonly statuses = optionsOf('sessionStatus');
  readonly sessions = signal<WorkoutSession[]>([]);
  readonly loading = signal(true);
  filter: HistoryFilter = { from: '', to: '', status: '', search: '' };

  readonly totals = computed(() => {
    const done = this.sessions().filter((s) => s.status === 'completed');
    return {
      count: done.length,
      seconds: done.reduce((a, s) => a + s.duration_seconds, 0),
      volume: done.reduce((a, s) => a + (s.summary?.total_volume ?? 0), 0),
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.workoutService.getHistory(this.filter).subscribe({
      next: (list) => {
        this.sessions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  reset(): void {
    this.filter = { from: '', to: '', status: '', search: '' };
    this.load();
  }
}

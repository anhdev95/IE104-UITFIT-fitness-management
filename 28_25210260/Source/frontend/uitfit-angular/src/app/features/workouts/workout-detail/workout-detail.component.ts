import { DatePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WorkoutPlan } from '../../../core/models/workout-plan.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { BadgePipe, LabelPipe } from '../../../shared/pipes/label.pipe';
import { NumPipe } from '../../../shared/pipes/num.pipe';

@Component({
  selector: 'app-workout-detail',
  imports: [NumPipe, RouterLink, DatePipe, LabelPipe, BadgePipe, DurationPipe, LoadingComponent, EmptyStateComponent, ImgFallbackDirective],
  templateUrl: './workout-detail.component.html',
})
export class WorkoutDetailComponent implements OnInit {
  readonly id = input.required<string>();

  private workoutService = inject(WorkoutService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly plan = signal<WorkoutPlan | null>(null);
  readonly loading = signal(true);
  readonly starting = signal(false);

  ngOnInit(): void {
    this.workoutService.getPlan(Number(this.id())).subscribe({
      next: (p) => {
        this.plan.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  start(): void {
    const p = this.plan()!;
    if (p.active_session_id) {
      this.router.navigate(['/workout-session', p.active_session_id]);
      return;
    }
    this.starting.set(true);
    this.workoutService.startSession(p.id).subscribe({
      next: (s) => this.router.navigate(['/workout-session', s.id]),
      error: () => this.starting.set(false),
    });
  }

  async remove(): Promise<void> {
    const p = this.plan()!;
    const ok = await this.confirm.confirm({
      title: 'Xóa lịch tập?',
      message: `Lịch tập “${p.name}” sẽ bị xóa. Lịch sử các buổi đã tập vẫn được giữ lại.`,
      confirmText: 'Xóa lịch tập',
      variant: 'danger',
    });
    if (!ok) return;
    this.workoutService.deletePlan(p.id).subscribe((res) => {
      this.toast.success(res.message);
      this.router.navigate(['/workouts']);
    });
  }
}

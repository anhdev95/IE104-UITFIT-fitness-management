import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlanTab, WorkoutPlan } from '../../../core/models/workout-plan.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { BadgePipe, LabelPipe } from '../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-workout-list',
  imports: [RouterLink, FormsModule, DatePipe, LabelPipe, BadgePipe, LoadingComponent, EmptyStateComponent],
  templateUrl: './workout-list.component.html',
})
export class WorkoutListComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly tabs: { value: PlanTab; label: string; icon: string }[] = [
    { value: 'all', label: 'Tất cả', icon: 'bi-grid' },
    { value: 'in_progress', label: 'Đang thực hiện', icon: 'bi-lightning-charge' },
    { value: 'completed', label: 'Đã hoàn thành', icon: 'bi-check2-circle' },
    { value: 'not_started', label: 'Chưa bắt đầu', icon: 'bi-hourglass' },
  ];

  readonly tab = signal<PlanTab>('all');
  readonly search = signal('');
  readonly plans = signal<WorkoutPlan[]>([]);
  readonly loading = signal(true);
  readonly busyId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  setTab(tab: PlanTab): void {
    this.tab.set(tab);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.workoutService.getPlans(this.tab(), this.search().trim()).subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  start(plan: WorkoutPlan): void {
    if (plan.active_session_id) {
      this.router.navigate(['/workout-session', plan.active_session_id]);
      return;
    }
    this.busyId.set(plan.id);
    this.workoutService.startSession(plan.id).subscribe({
      next: (session) => this.router.navigate(['/workout-session', session.id]),
      error: () => this.busyId.set(null),
    });
  }

  async remove(plan: WorkoutPlan): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Xóa lịch tập?',
      message: `Lịch tập “${plan.name}” sẽ bị xóa. Lịch sử các buổi đã tập vẫn được giữ lại.`,
      confirmText: 'Xóa lịch tập',
      variant: 'danger',
    });
    if (!ok) return;
    this.workoutService.deletePlan(plan.id).subscribe((res) => {
      this.toast.success(res.message);
      this.plans.update((list) => list.filter((p) => p.id !== plan.id));
    });
  }
}

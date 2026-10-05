import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ChartData } from 'chart.js';
import { PlanSummary, UserDashboard } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { WorkoutService } from '../../core/services/workout.service';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { BadgePipe, LabelPipe } from '../../shared/pipes/label.pipe';
import { dayMonth } from '../../shared/form-utils';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, LabelPipe, BadgePipe, DurationPipe, ChartComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private workoutService = inject(WorkoutService);
  private router = inject(Router);

  readonly data = signal<UserDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly starting = signal(false);
  readonly today = new Date();

  readonly firstName = computed(() => this.data()?.user.name.split(' ').pop() ?? '');
  readonly weeklyPercent = computed(() => {
    const d = this.data();
    return d ? Math.min(100, Math.round((d.weeklyCompleted / d.weeklyGoal) * 100)) : 0;
  });

  /** 7 ngày trong tuần (T2 → CN) kèm lịch tập */
  readonly weekDays = computed(() => {
    const plans = this.data()?.weekPlans ?? [];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        date: d,
        isToday: d.toDateString() === now.toDateString(),
        plans: plans.filter((p) => p.scheduled_date === iso),
      };
    });
  });

  readonly weightChart = computed<ChartData>(() => {
    const points = this.data()?.weightProgress ?? [];
    return {
      labels: points.map((p) => dayMonth(p.date)),
      datasets: [{
        label: 'Cân nặng (kg)',
        data: points.map((p) => p.weight),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      }],
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.dashboardService.getUserDashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  startWorkout(plan: PlanSummary): void {
    if (plan.active_session_id) {
      this.router.navigate(['/workout-session', plan.active_session_id]);
      return;
    }
    this.starting.set(true);
    this.workoutService.startSession(plan.id).subscribe({
      next: (s) => this.router.navigate(['/workout-session', s.id]),
      error: () => this.starting.set(false),
    });
  }
}

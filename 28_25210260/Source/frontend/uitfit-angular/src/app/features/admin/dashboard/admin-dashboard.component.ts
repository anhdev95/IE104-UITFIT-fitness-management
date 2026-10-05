import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartData } from 'chart.js';
import { AdminDashboard } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { BadgePipe, LabelPipe } from '../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, LabelPipe, BadgePipe, ChartComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  readonly data = signal<AdminDashboard | null>(null);
  readonly loading = signal(true);

  readonly kpis = computed(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Tổng users', value: d.totalUsers, icon: 'bi-people', color: 'primary' },
      { label: 'Tổng exercises', value: d.totalExercises, icon: 'bi-collection', color: 'success' },
      { label: 'Tổng workout plans', value: d.totalWorkoutPlans, icon: 'bi-calendar2-week', color: 'warning' },
      { label: 'Tổng workout sessions', value: d.totalWorkoutSessions, icon: 'bi-lightning-charge', color: 'danger' },
    ];
  });

  readonly sessionsChart = computed<ChartData>(() => {
    const rows = this.data()?.sessionsByMonth ?? [];
    return {
      labels: rows.map((r) => r.label),
      datasets: [{ label: 'Buổi tập hoàn thành', data: rows.map((r) => r.total), backgroundColor: '#2563EB', borderRadius: 8, maxBarThickness: 48 }],
    };
  });

  readonly maxUsage = computed(() => Math.max(1, ...(this.data()?.popularExercises ?? []).map((e) => e.usage_count)));

  ngOnInit(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartData } from 'chart.js';
import { HealthRange, HealthStatistics } from '../../../core/models/health-record.model';
import { StatisticsService } from '../../../core/services/statistics.service';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { dayMonth } from '../../../shared/form-utils';
import { NumPipe } from '../../../shared/pipes/num.pipe';

@Component({
  selector: 'app-health-progress',
  imports: [NumPipe, RouterLink, DatePipe, DecimalPipe, ChartComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './health-progress.component.html',
})
export class HealthProgressComponent implements OnInit {
  private statisticsService = inject(StatisticsService);

  readonly ranges: { value: HealthRange; label: string }[] = [
    { value: '7d', label: '7 ngày' },
    { value: '30d', label: '30 ngày' },
    { value: '3m', label: '3 tháng' },
    { value: '6m', label: '6 tháng' },
    { value: '1y', label: '1 năm' },
  ];
  readonly range = signal<HealthRange>('3m');
  readonly stats = signal<HealthStatistics | null>(null);
  readonly loading = signal(true);

  private labels = computed(() =>
    (this.stats()?.series ?? []).map((p) => dayMonth(p.date)),
  );

  readonly weightChart = computed<ChartData>(() => ({
    labels: this.labels(),
    datasets: [{
      label: 'Cân nặng (kg)', data: (this.stats()?.series ?? []).map((p) => p.weight),
      borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,.12)', fill: true, tension: 0.35,
    }],
  }));

  readonly bmiChart = computed<ChartData>(() => ({
    labels: this.labels(),
    datasets: [{
      label: 'BMI', data: (this.stats()?.series ?? []).map((p) => p.bmi),
      borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,.12)', fill: true, tension: 0.35,
    }],
  }));

  readonly bodyChart = computed<ChartData>(() => ({
    labels: this.labels(),
    datasets: [
      {
        label: 'Mỡ cơ thể (%)', data: (this.stats()?.series ?? []).map((p) => p.body_fat),
        borderColor: '#F59E0B', backgroundColor: '#F59E0B', tension: 0.35, spanGaps: true,
      },
      {
        label: 'Khối lượng cơ (kg)', data: (this.stats()?.series ?? []).map((p) => p.muscle_mass),
        borderColor: '#0F2D46', backgroundColor: '#0F2D46', tension: 0.35, spanGaps: true,
      },
    ],
  }));

  readonly hasBodyData = computed(() => (this.stats()?.series ?? []).some((p) => p.body_fat || p.muscle_mass));

  ngOnInit(): void {
    this.load();
  }

  setRange(r: HealthRange): void {
    this.range.set(r);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.statisticsService.getHealth(this.range()).subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeClass(value: number | null, goodWhenNegative = true): string {
    if (!value) return 'text-muted';
    return (value < 0) === goodWhenNegative ? 'text-success' : 'text-danger';
  }
}

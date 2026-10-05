import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#6B7280';

/** Wrapper nhỏ quanh Chart.js — tự vẽ lại khi data thay đổi */
@Component({
  selector: 'app-chart',
  template: `<div class="chart-box" [style.height.px]="height()"><canvas #canvas></canvas></div>`,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  readonly type = input<ChartType>('line');
  readonly data = input.required<ChartData>();
  readonly options = input<ChartOptions>({});
  readonly height = input(260);

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;
  private ready = false;

  constructor() {
    // Data thay đổi → cập nhật chart tại chỗ (mượt hơn hủy và vẽ lại)
    effect(() => {
      const data = this.data();
      if (this.ready && this.chart) {
        this.chart.data = data;
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.render(this.data(), this.options());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(data: ChartData, options: ChartOptions): void {
    this.chart?.destroy();
    const config: ChartConfiguration = {
      type: this.type(),
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 450 },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: (data.datasets?.length ?? 0) > 1, position: 'bottom' } },
        scales: this.type() === 'doughnut' ? {} : {
          x: { grid: { display: false } },
          y: { grid: { color: '#EEF2F7' }, beginAtZero: false },
        },
        ...options,
      } as ChartOptions,
    };
    this.chart = new Chart(this.canvas().nativeElement, config);
  }
}

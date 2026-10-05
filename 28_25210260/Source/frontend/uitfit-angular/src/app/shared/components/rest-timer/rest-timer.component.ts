import { Component, computed, inject, OnDestroy, output, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { DurationPipe } from '../../pipes/duration.pipe';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

const SOUND_KEY = 'uitfit_timer_sound';
const RING_RADIUS = 54;

/**
 * Đồng hồ đếm ngược thời gian nghỉ giữa các set.
 * Chạy hoàn toàn ở Angular (setInterval + mốc thời gian), KHÔNG gọi backend mỗi giây.
 */
@Component({
  selector: 'app-rest-timer',
  imports: [DurationPipe],
  templateUrl: './rest-timer.component.html',
})
export class RestTimerComponent implements OnDestroy {
  private toast = inject(ToastService);

  readonly state = signal<TimerState>('idle');
  readonly duration = signal(60);
  readonly remaining = signal(60);
  readonly label = signal('Sẵn sàng');
  readonly soundEnabled = signal(this.readSound());

  readonly finished = output<void>();
  readonly skipped = output<void>();

  readonly circumference = 2 * Math.PI * RING_RADIUS;
  readonly radius = RING_RADIUS;
  readonly dashOffset = computed(() => {
    const total = this.duration() || 1;
    return this.circumference * (1 - Math.min(1, this.remaining() / total));
  });
  readonly displaySeconds = computed(() => Math.ceil(this.remaining()));

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private endAt = 0;
  private audioCtx?: AudioContext;

  /** Bắt đầu đếm ngược (mặc định dùng lại duration hiện tại) */
  start(seconds?: number, label?: string): void {
    const total = Math.max(1, Math.round(seconds ?? this.duration()));
    this.duration.set(total);
    this.remaining.set(total);
    if (label) this.label.set(label);
    this.run();
  }

  pause(): void {
    if (this.state() !== 'running') return;
    this.stopInterval();
    this.remaining.set(Math.max(0, (this.endAt - Date.now()) / 1000));
    this.state.set('paused');
  }

  resume(): void {
    if (this.state() !== 'paused') return;
    this.run();
  }

  /** Bỏ qua thời gian nghỉ còn lại */
  skip(): void {
    this.stopInterval();
    this.remaining.set(0);
    this.state.set('idle');
    this.label.set('Đã bỏ qua nghỉ');
    this.skipped.emit();
  }

  add30Seconds(): void {
    const s = this.state();
    if (s === 'running') {
      this.endAt += 30_000;
      this.duration.update((d) => d + 30);
      this.tick();
    } else if (s === 'paused') {
      this.remaining.update((r) => r + 30);
      this.duration.update((d) => d + 30);
    } else {
      // idle / finished → nghỉ thêm 30 giây
      this.start(30, 'Nghỉ thêm 30 giây');
    }
  }

  /** Về lại thời gian ban đầu, chờ bấm Bắt đầu */
  reset(): void {
    this.stopInterval();
    this.remaining.set(this.duration());
    this.state.set('idle');
  }

  toggleSound(): void {
    const next = !this.soundEnabled();
    this.soundEnabled.set(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (next) {
      this.unlockAudio();
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => undefined);
      }
    }
  }

  ngOnDestroy(): void {
    this.stopInterval();
    this.audioCtx?.close().catch(() => undefined);
  }

  private run(): void {
    this.stopInterval();
    this.unlockAudio();
    this.endAt = Date.now() + this.remaining() * 1000;
    this.state.set('running');
    this.intervalId = setInterval(() => this.tick(), 200);
  }

  private tick(): void {
    const left = Math.max(0, (this.endAt - Date.now()) / 1000);
    this.remaining.set(left);
    if (left <= 0) this.finish();
  }

  private finish(): void {
    this.stopInterval();
    this.remaining.set(0);
    this.state.set('finished');
    this.label.set('Hết giờ nghỉ!');
    this.toast.info('⏰ Hết thời gian nghỉ — vào set tiếp theo thôi!');
    if (this.soundEnabled()) this.beep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification('UITfit', { body: 'Hết thời gian nghỉ, tiếp tục set tiếp theo!' });
    }
    this.finished.emit();
  }

  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Trình duyệt chỉ cho phát âm thanh sau thao tác người dùng → khởi tạo AudioContext khi bấm nút */
  private unlockAudio(): void {
    if (!this.soundEnabled()) return;
    try {
      this.audioCtx ??= new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    } catch {
      /* trình duyệt không hỗ trợ */
    }
  }

  /** Âm thanh nhẹ: 3 tiếng bíp ngắn */
  private beep(): void {
    const ctx = this.audioCtx;
    if (!ctx) return;
    [0, 0.25, 0.5].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 2 ? 1046 : 784;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  }

  private readSound(): boolean {
    try {
      return localStorage.getItem(SOUND_KEY) !== '0';
    } catch {
      return true;
    }
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../core/models/api-response.model';
import { SessionExercise, SessionSummary, WorkoutSession } from '../../../core/models/workout-session.model';
import { WorkoutSet } from '../../../core/models/workout-set.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { RestTimerComponent } from '../../../shared/components/rest-timer/rest-timer.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';

/** Dữ liệu người dùng đang nhập cho một set (chưa lưu) */
interface SetDraft {
  actual_reps: number | null;
  actual_weight: number | null;
  rpe: number | null;
  rest_seconds: number;
  note: string;
  error?: string;
}

/**
 * Màn hình thực hiện buổi tập: ghi reps / kg / RPE / note cho từng set,
 * Save Set → API success → Start Rest Timer.
 */
@Component({
  selector: 'app-workout-session',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, DurationPipe, LabelPipe, LoadingComponent, RestTimerComponent, ImgFallbackDirective],
  templateUrl: './workout-session.component.html',
})
export class WorkoutSessionComponent implements OnInit, OnDestroy {
  readonly id = input.required<string>();

  private workoutService = inject(WorkoutService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly timer = viewChild(RestTimerComponent);

  readonly session = signal<WorkoutSession | null>(null);
  readonly loading = signal(true);
  readonly currentIndex = signal(0);
  readonly savingSetId = signal<number | null>(null);
  readonly finishing = signal(false);
  readonly now = signal(Date.now());

  /** Draft theo id set — giữ nguyên khi reload session */
  drafts = new Map<number, SetDraft>();
  private clock?: ReturnType<typeof setInterval>;

  readonly exercises = computed(() => this.session()?.exercises ?? []);
  readonly current = computed<SessionExercise | null>(() => this.exercises()[this.currentIndex()] ?? null);
  readonly summary = computed<SessionSummary>(() => summarize(this.exercises()));

  /** Thời gian đã tập — tính tại client từ started_at, cập nhật mỗi giây (không gọi API) */
  readonly elapsed = computed(() => {
    const s = this.session();
    return s ? Math.max(0, Math.floor((this.now() - new Date(s.started_at).getTime()) / 1000)) : 0;
  });

  /** Set kế tiếp chưa hoàn thành của bài hiện tại */
  readonly nextSet = computed(() => this.current()?.sets.find((s) => !s.completed) ?? null);

  ngOnInit(): void {
    this.load(true);
    this.clock = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.clock) clearInterval(this.clock);
  }

  load(initial = false): void {
    this.workoutService.getSession(Number(this.id())).subscribe({
      next: (s) => {
        if (s.status !== 'in_progress') {
          this.toast.info('Buổi tập này đã kết thúc.');
          this.router.navigate(['/history', s.id], { replaceUrl: true });
          return;
        }
        this.session.set(s);
        this.pruneDrafts(s);
        if (initial) {
          // Mở bài tập đầu tiên còn set chưa hoàn thành
          const idx = (s.exercises ?? []).findIndex((e) => e.sets.some((set) => !set.completed));
          this.currentIndex.set(idx >= 0 ? idx : 0);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/workouts']);
      },
    });
  }

  select(index: number): void {
    this.currentIndex.set(index);
  }

  /** Draft của set (tạo mới nếu chưa có) — gợi ý sẵn giá trị mục tiêu để nhập nhanh */
  draft(set: WorkoutSet): SetDraft {
    let d = this.drafts.get(set.id);
    if (!d) {
      d = {
        actual_reps: set.actual_reps ?? set.target_reps,
        actual_weight: set.actual_weight ?? set.target_weight,
        rpe: set.rpe,
        rest_seconds: set.rest_seconds,
        note: set.note ?? '',
      };
      this.drafts.set(set.id, d);
    }
    return d;
  }

  /** Tick hoàn thành set: validate → PUT /workout-sets/{id} → thành công → chạy Rest Timer */
  completeSet(ex: SessionExercise, set: WorkoutSet): void {
    const d = this.draft(set);
    d.error = this.validateDraft(d);
    if (d.error) return;

    this.savingSetId.set(set.id);
    this.workoutService
      .updateSet(set.id, {
        actual_reps: d.actual_reps,
        actual_weight: d.actual_weight,
        rpe: d.rpe,
        rest_seconds: d.rest_seconds,
        note: d.note?.trim() || null,
        completed: true,
      })
      .subscribe({
        next: (saved) => {
          this.savingSetId.set(null);
          this.replaceSet(saved);
          const name = ex.exercise?.name ?? 'bài tập';
          const exerciseDone = this.current()?.sets.every((s) => s.completed);
          const allDone = this.summary().completed_sets === this.summary().total_sets;

          if (allDone) {
            this.toast.success('🎉 Bạn đã hoàn thành tất cả các set! Bấm “Hoàn thành buổi tập” để lưu kết quả.');
          } else {
            this.timer()?.start(saved.rest_seconds, `Nghỉ sau Set ${saved.set_number} – ${name}`);
            if (exerciseDone) {
              this.toast.success(`Hoàn thành ${name}!`);
              this.goToNextIncomplete();
            }
          }
        },
        error: (err: ApiError) => {
          this.savingSetId.set(null);
          d.error = Object.values(err.errors ?? {})[0]?.[0] ?? err.message;
        },
      });
  }

  /** Bỏ tick để sửa lại set đã hoàn thành */
  undoSet(set: WorkoutSet): void {
    this.savingSetId.set(set.id);
    this.workoutService.updateSet(set.id, { ...this.payloadOf(set), completed: false }).subscribe({
      next: (saved) => {
        this.savingSetId.set(null);
        this.replaceSet(saved);
      },
      error: () => this.savingSetId.set(null),
    });
  }

  addSet(ex: SessionExercise): void {
    const sessionId = this.session()!.id;
    this.workoutService.addSet(sessionId, ex.exercise_id).subscribe((set) => {
      this.toast.success(`Đã thêm Set ${set.set_number}`);
      this.load();
    });
  }

  deleteSet(set: WorkoutSet): void {
    if (set.completed) return;
    this.workoutService.deleteSet(set.id).subscribe(() => {
      this.toast.success('Đã xóa set');
      this.load();
    });
  }

  async finish(): Promise<void> {
    const s = this.summary();
    if (s.completed_sets === 0) {
      this.toast.warning('Bạn cần hoàn thành ít nhất 1 set trước khi kết thúc buổi tập.');
      return;
    }
    const remaining = s.total_sets - s.completed_sets;
    const note = await this.confirm.prompt({
      title: 'Hoàn thành buổi tập?',
      message: remaining > 0
        ? `Bạn còn ${remaining} set chưa hoàn thành. Vẫn kết thúc buổi tập?`
        : `Tuyệt vời! Bạn đã hoàn thành ${s.completed_sets} set với tổng volume ${s.total_volume.toLocaleString('vi-VN')} kg.`,
      confirmText: 'Hoàn thành',
      variant: 'success',
      inputLabel: 'Ghi chú buổi tập (không bắt buộc)',
      inputPlaceholder: 'Cảm nhận, mức năng lượng, điều cần cải thiện...',
    });
    if (note === null) return;

    this.finishing.set(true);
    this.workoutService.completeSession(this.session()!.id, note.trim() || null).subscribe({
      next: (done) => {
        this.toast.success('Chúc mừng! Bạn đã hoàn thành buổi tập 💪');
        this.router.navigate(['/history', done.id]);
      },
      error: () => this.finishing.set(false),
    });
  }

  async cancel(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Hủy buổi tập?',
      message: 'Buổi tập sẽ được đánh dấu “Đã hủy”. Các set đã ghi vẫn được lưu trong lịch sử.',
      confirmText: 'Hủy buổi tập',
      cancelText: 'Tiếp tục tập',
      variant: 'danger',
    });
    if (!ok) return;
    this.workoutService.cancelSession(this.session()!.id).subscribe(() => {
      this.toast.info('Đã hủy buổi tập');
      this.router.navigate(['/workouts']);
    });
  }

  onTimerFinished(): void {
    // Tự chuyển focus sang bài còn set chưa xong nếu bài hiện tại đã xong
    if (this.current()?.sets.every((s) => s.completed)) this.goToNextIncomplete();
  }

  exerciseDone(ex: SessionExercise): boolean {
    return ex.sets.length > 0 && ex.sets.every((s) => s.completed);
  }

  completedCount(ex: SessionExercise): number {
    return ex.sets.filter((s) => s.completed).length;
  }

  private goToNextIncomplete(): void {
    const list = this.exercises();
    const start = this.currentIndex();
    for (let i = 1; i <= list.length; i++) {
      const idx = (start + i) % list.length;
      if (list[idx].sets.some((s) => !s.completed)) {
        this.currentIndex.set(idx);
        return;
      }
    }
  }

  private validateDraft(d: SetDraft): string | undefined {
    if (d.actual_reps === null || d.actual_reps === undefined || (d.actual_reps as unknown) === '') return 'Nhập số reps thực tế.';
    if (d.actual_reps < 0 || !Number.isInteger(Number(d.actual_reps))) return 'Reps phải là số nguyên ≥ 0.';
    if (d.actual_weight !== null && (d.actual_weight as unknown) !== '' && d.actual_weight < 0) return 'Kg phải ≥ 0.';
    if (d.rpe !== null && (d.rpe as unknown) !== '' && (d.rpe < 1 || d.rpe > 10)) return 'RPE từ 1 đến 10.';
    if (d.rest_seconds < 0) return 'Thời gian nghỉ phải ≥ 0.';
    // Chuẩn hóa '' → null
    if ((d.actual_weight as unknown) === '') d.actual_weight = null;
    if ((d.rpe as unknown) === '') d.rpe = null;
    return undefined;
  }

  private payloadOf(set: WorkoutSet) {
    const d = this.draft(set);
    return { actual_reps: d.actual_reps, actual_weight: d.actual_weight, rpe: d.rpe, rest_seconds: d.rest_seconds, note: d.note || null };
  }

  /** Cập nhật 1 set trong state, không cần reload toàn bộ */
  private replaceSet(saved: WorkoutSet): void {
    this.session.update((s) => {
      if (!s) return s;
      const exercises = (s.exercises ?? []).map((ex) =>
        ex.exercise_id !== saved.exercise_id ? ex : { ...ex, sets: ex.sets.map((x) => (x.id === saved.id ? saved : x)) },
      );
      return { ...s, exercises };
    });
    this.draft(saved).error = undefined;
  }

  /** Bỏ draft của các set không còn tồn tại (vd: vừa xóa set) */
  private pruneDrafts(s: WorkoutSession): void {
    const ids = new Set((s.exercises ?? []).flatMap((e) => e.sets.map((x) => x.id)));
    for (const id of this.drafts.keys()) if (!ids.has(id)) this.drafts.delete(id);
  }
}

function summarize(exercises: SessionExercise[]): SessionSummary {
  const sets = exercises.flatMap((e) => e.sets);
  const done = sets.filter((s) => s.completed);
  return {
    total_exercises: exercises.length,
    completed_exercises: exercises.filter((e) => e.sets.length && e.sets.every((s) => s.completed)).length,
    total_sets: sets.length,
    completed_sets: done.length,
    total_reps: done.reduce((a, s) => a + (s.actual_reps ?? 0), 0),
    total_volume: Math.round(done.reduce((a, s) => a + (s.actual_reps ?? 0) * (s.actual_weight ?? 0), 0) * 100) / 100,
    progress: sets.length ? Math.round((done.length / sets.length) * 100) : 0,
  };
}

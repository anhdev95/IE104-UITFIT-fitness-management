import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Exercise } from '../../../core/models/exercise.model';
import { WorkoutPlan } from '../../../core/models/workout-plan.model';
import { ExerciseService } from '../../../core/services/exercise.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { BadgePipe, LabelPipe } from '../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-exercise-detail',
  imports: [RouterLink, FormsModule, LabelPipe, BadgePipe, DurationPipe, LoadingComponent, EmptyStateComponent, ImgFallbackDirective],
  templateUrl: './exercise-detail.component.html',
})
export class ExerciseDetailComponent implements OnInit {
  /** :id từ route (withComponentInputBinding) */
  readonly id = input.required<string>();

  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  readonly exercise = signal<Exercise | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  readonly showAddModal = signal(false);
  readonly plans = signal<WorkoutPlan[]>([]);
  readonly selectedPlan = signal<number | 'new'>('new');

  /** Nhúng video YouTube nếu có */
  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.exercise()?.video_url;
    const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${match[1]}`) : null;
  });

  readonly targetMuscles = computed(() =>
    (this.exercise()?.target_muscles ?? '').split(',').map((m) => m.trim()).filter(Boolean),
  );

  ngOnInit(): void {
    this.exerciseService.getExercise(Number(this.id())).subscribe({
      next: (e) => {
        this.exercise.set(e);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.showAddModal.set(true);
    this.workoutService.getPlans('not_started').subscribe((plans) => {
      this.plans.set(plans);
      this.selectedPlan.set(plans[0]?.id ?? 'new');
    });
  }

  /** Chuyển tới form tạo/sửa lịch tập, kèm bài tập cần thêm */
  confirmAdd(): void {
    const exId = this.exercise()!.id;
    const target = this.selectedPlan();
    this.showAddModal.set(false);
    if (target === 'new') {
      this.router.navigate(['/workouts/create'], { queryParams: { add: exId } });
    } else {
      this.router.navigate(['/workouts', target, 'edit'], { queryParams: { add: exId } });
    }
  }
}

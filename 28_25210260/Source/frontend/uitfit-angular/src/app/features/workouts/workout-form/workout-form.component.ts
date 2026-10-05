import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ApiError } from '../../../core/models/api-response.model';
import { Difficulty, Exercise } from '../../../core/models/exercise.model';
import { WorkoutPlan, WorkoutPlanExercise, WorkoutPlanPayload } from '../../../core/models/workout-plan.model';
import { ExerciseService } from '../../../core/services/exercise.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { applyServerErrors, todayIso } from '../../../shared/form-utils';
import { LabelPipe, optionsOf } from '../../../shared/pipes/label.pipe';

const minOneExercise = (control: AbstractControl): ValidationErrors | null =>
  (control as FormArray).length ? null : { minOne: true };

@Component({
  selector: 'app-workout-form',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, LabelPipe, FieldErrorComponent, LoadingComponent, ImgFallbackDirective],
  templateUrl: './workout-form.component.html',
})
export class WorkoutFormComponent implements OnInit {
  /** :id khi sửa (withComponentInputBinding) */
  readonly id = input<string>();

  private fb = inject(FormBuilder);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly isEdit = computed(() => !!this.id());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly plan = signal<WorkoutPlan | null>(null);
  readonly library = signal<Exercise[]>([]);
  readonly pickerSearch = signal('');
  readonly pickerGroup = signal('all');
  readonly difficulties = optionsOf('difficulty');
  readonly groups = [{ value: 'all', label: 'Tất cả' }, ...optionsOf('muscle')];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    scheduled_date: [todayIso() as string | null],
    description: [null as string | null, Validators.maxLength(2000)],
    difficulty: [null as Difficulty | null],
    estimated_duration: [60 as number | null, [Validators.min(1), Validators.max(600)]],
    exercises: this.fb.array<FormGroup>([], minOneExercise),
  });

  get exercises(): FormArray<FormGroup> {
    return this.form.controls.exercises;
  }

  private exerciseMap = computed(() => new Map(this.library().map((e) => [e.id, e])));

  readonly filteredLibrary = computed(() => {
    const q = this.pickerSearch().toLowerCase().trim();
    const g = this.pickerGroup();
    return this.library().filter((e) => (g === 'all' || e.muscle_group === g) && (!q || e.name.toLowerCase().includes(q)));
  });

  ngOnInit(): void {
    const planId = this.id();
    forkJoin({
      library: this.exerciseService.getExercises(),
      plan: planId ? this.workoutService.getPlan(Number(planId)) : of(null),
    }).subscribe({
      next: ({ library, plan }) => {
        this.library.set(library);
        if (plan) this.patchPlan(plan);
        const addId = Number(this.route.snapshot.queryParamMap.get('add'));
        const toAdd = library.find((e) => e.id === addId);
        if (toAdd) {
          this.addExercise(toAdd);
          this.toast.info(`Đã thêm “${toAdd.name}” vào lịch tập`);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/workouts']);
      },
    });
  }

  exerciseOf(group: FormGroup): Exercise | undefined {
    return this.exerciseMap().get(group.value.exercise_id);
  }

  isAdded(e: Exercise): boolean {
    return this.exercises.controls.some((c) => c.value.exercise_id === e.id);
  }

  addExercise(e: Exercise, values?: Partial<WorkoutPlanExercise>): void {
    this.exercises.push(
      this.fb.group({
        exercise_id: [e.id, Validators.required],
        target_sets: [values?.target_sets ?? e.default_sets, [Validators.required, Validators.min(1), Validators.max(20)]],
        target_reps: [values?.target_reps ?? e.default_reps.split('-')[0], [Validators.required, Validators.pattern(/^\d{1,3}(\s*-\s*\d{1,3})?$/)]],
        target_weight: [values?.target_weight ?? null, [Validators.min(0), Validators.max(1000)]],
        rest_seconds: [values?.rest_seconds ?? e.default_rest_seconds, [Validators.required, Validators.min(0), Validators.max(900)]],
        note: [values?.note ?? null, Validators.maxLength(255)],
      }),
    );
    this.exercises.markAsDirty();
  }

  removeExercise(index: number): void {
    this.exercises.removeAt(index);
  }

  move(index: number, delta: -1 | 1): void {
    const target = index + delta;
    if (target < 0 || target >= this.exercises.length) return;
    const control = this.exercises.at(index);
    this.exercises.removeAt(index);
    this.exercises.insert(target, control);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exercises.controls.forEach((c) => c.markAllAsTouched());
      if (!this.exercises.length) this.toast.error('Lịch tập phải có ít nhất 1 bài tập.');
      return;
    }
    const v = this.form.getRawValue();
    const payload: WorkoutPlanPayload = {
      name: v.name!.trim(),
      scheduled_date: v.scheduled_date || null,
      description: v.description || null,
      difficulty: v.difficulty || null,
      estimated_duration: v.estimated_duration || null,
      exercises: v.exercises.map((e, i) => ({
        exercise_id: e['exercise_id'],
        order_index: i + 1,
        target_sets: Number(e['target_sets']),
        target_reps: String(e['target_reps']),
        target_weight: e['target_weight'] === null || e['target_weight'] === '' ? null : Number(e['target_weight']),
        rest_seconds: Number(e['rest_seconds']),
        note: e['note'] || null,
      })),
    };

    this.saving.set(true);
    const request = this.isEdit()
      ? this.workoutService.updatePlan(Number(this.id()), payload)
      : this.workoutService.createPlan(payload);

    request.subscribe({
      next: (plan) => {
        this.toast.success(this.isEdit() ? 'Cập nhật lịch tập thành công' : 'Tạo lịch tập thành công');
        this.router.navigate(['/workouts', plan.id]);
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        if (err.status === 422) applyServerErrors(this.form, err);
      },
    });
  }

  private patchPlan(plan: WorkoutPlan): void {
    this.plan.set(plan);
    this.form.patchValue({
      name: plan.name,
      scheduled_date: plan.scheduled_date,
      description: plan.description,
      difficulty: plan.difficulty,
      estimated_duration: plan.estimated_duration,
    });
    for (const pe of plan.exercises ?? []) {
      const e = this.exerciseMap().get(pe.exercise_id) ?? pe.exercise;
      if (e) this.addExercise(e, pe);
    }
  }
}

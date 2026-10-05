import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../../core/models/api-response.model';
import { Difficulty, ExercisePayload, MuscleGroup } from '../../../../core/models/exercise.model';
import { ExerciseService } from '../../../../core/services/exercise.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../../shared/directives/img-fallback.directive';
import { applyServerErrors } from '../../../../shared/form-utils';
import { optionsOf } from '../../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-exercise-admin-form',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, LoadingComponent, ImgFallbackDirective],
  templateUrl: './exercise-admin-form.component.html',
})
export class ExerciseAdminFormComponent implements OnInit {
  readonly id = input<string>();

  private fb = inject(FormBuilder);
  private exerciseService = inject(ExerciseService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly isEdit = computed(() => !!this.id());
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly preview = signal<string | null>(null);
  readonly groups = optionsOf('muscle');
  readonly difficulties = optionsOf('difficulty');
  private imageFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    muscle_group: ['chest' as MuscleGroup, Validators.required],
    difficulty: ['beginner' as Difficulty, Validators.required],
    equipment: [''],
    description: ['', Validators.required],
    instructions: ['', Validators.required],
    target_muscles: [''],
    tips: [''],
    image: [''],
    video_url: ['', Validators.pattern(/^(https?:\/\/.+)?$/)],
    default_sets: [3, [Validators.required, Validators.min(1), Validators.max(20)]],
    default_reps: ['10-12', [Validators.required, Validators.maxLength(20)]],
    default_rest_seconds: [60, [Validators.required, Validators.min(0), Validators.max(900)]],
    status: ['active' as 'active' | 'inactive'],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.loading.set(true);
    this.exerciseService.adminGet(Number(id)).subscribe({
      next: (e) => {
        this.form.patchValue({
          ...e,
          equipment: e.equipment ?? '',
          target_muscles: e.target_muscles ?? '',
          tips: e.tips ?? '',
          image: e.image ?? '',
          video_url: e.video_url ?? '',
        });
        this.preview.set(e.image_url);
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/admin/exercises']),
    });
  }

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file && file.size > 4 * 1024 * 1024) {
      this.toast.error('Ảnh tối đa 4MB.');
      return;
    }
    this.imageFile = file;
    if (file) this.preview.set(URL.createObjectURL(file));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: ExercisePayload = {
      ...v,
      equipment: v.equipment || null,
      target_muscles: v.target_muscles || null,
      tips: v.tips || null,
      image: this.imageFile ? null : v.image || null,
      video_url: v.video_url || null,
    };
    this.saving.set(true);
    const req = this.isEdit()
      ? this.exerciseService.adminUpdate(Number(this.id()), payload, this.imageFile)
      : this.exerciseService.adminCreate(payload, this.imageFile);
    req.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Cập nhật bài tập thành công' : 'Thêm bài tập thành công');
        this.router.navigate(['/admin/exercises']);
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        if (err.status === 422) applyServerErrors(this.form, err);
      },
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Exercise, ExerciseFilter } from '../../../../core/models/exercise.model';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ExerciseService } from '../../../../core/services/exercise.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../../shared/directives/img-fallback.directive';
import { BadgePipe, LabelPipe, optionsOf } from '../../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-exercise-admin-list',
  imports: [FormsModule, RouterLink, LabelPipe, BadgePipe, LoadingComponent, EmptyStateComponent, ImgFallbackDirective],
  templateUrl: './exercise-admin-list.component.html',
})
export class ExerciseAdminListComponent implements OnInit {
  private exerciseService = inject(ExerciseService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  readonly groups = optionsOf('muscle');
  readonly difficulties = optionsOf('difficulty');
  readonly exercises = signal<Exercise[]>([]);
  readonly loading = signal(true);
  filter: ExerciseFilter = { search: '', muscle_group: '', difficulty: '', status: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.exerciseService.adminList(this.filter).subscribe({
      next: (list) => {
        this.exercises.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  reset(): void {
    this.filter = { search: '', muscle_group: '', difficulty: '', status: '' };
    this.load();
  }

  async remove(e: Exercise): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Xóa bài tập?',
      message: e.usage_count
        ? `“${e.name}” đang được dùng trong ${e.usage_count} lịch tập — bài tập sẽ được chuyển sang ngừng hoạt động thay vì xóa.`
        : `Bài tập “${e.name}” sẽ bị xóa vĩnh viễn.`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    this.exerciseService.adminDelete(e.id).subscribe((res) => {
      this.toast.success(res.message);
      this.load();
    });
  }
}

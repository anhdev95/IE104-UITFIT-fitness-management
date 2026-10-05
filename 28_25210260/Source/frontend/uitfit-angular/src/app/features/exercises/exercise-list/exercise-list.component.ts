import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Exercise } from '../../../core/models/exercise.model';
import { ExerciseService } from '../../../core/services/exercise.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';
import { BadgePipe, LabelPipe, optionsOf } from '../../../shared/pipes/label.pipe';

@Component({
  selector: 'app-exercise-list',
  imports: [FormsModule, RouterLink, LabelPipe, BadgePipe, LoadingComponent, EmptyStateComponent, ImgFallbackDirective],
  templateUrl: './exercise-list.component.html',
})
export class ExerciseListComponent implements OnInit {
  private exerciseService = inject(ExerciseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly groups = [{ value: 'all', label: 'Tất cả' }, ...optionsOf('muscle')];
  readonly difficulties = optionsOf('difficulty');

  readonly exercises = signal<Exercise[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly group = signal('all');
  readonly difficulty = signal('');

  private search$ = new Subject<string>();

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.search.set(q.get('search') ?? '');
    this.group.set(q.get('muscle_group') ?? 'all');
    this.difficulty.set(q.get('difficulty') ?? '');

    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
    this.load();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.search$.next(value);
  }

  setGroup(value: string): void {
    this.group.set(value);
    this.load();
  }

  setDifficulty(value: string): void {
    this.difficulty.set(value);
    this.load();
  }

  clearFilters(): void {
    this.search.set('');
    this.group.set('all');
    this.difficulty.set('');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filter = { search: this.search().trim(), muscle_group: this.group(), difficulty: this.difficulty() };
    // Giữ filter trên URL để có thể chia sẻ / quay lại
    this.router.navigate([], {
      queryParams: { search: filter.search || null, muscle_group: filter.muscle_group === 'all' ? null : filter.muscle_group, difficulty: filter.difficulty || null },
      replaceUrl: true,
    });
    this.exerciseService.getExercises(filter).subscribe({
      next: (list) => {
        this.exercises.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

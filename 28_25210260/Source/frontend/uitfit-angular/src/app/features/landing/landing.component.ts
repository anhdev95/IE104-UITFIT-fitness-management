import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Exercise } from '../../core/models/exercise.model';
import { AuthService } from '../../core/services/auth.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { BadgePipe, LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, LabelPipe, BadgePipe, ImgFallbackDirective],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  readonly auth = inject(AuthService);
  private exerciseService = inject(ExerciseService);
  readonly exercises = signal<Exercise[]>([]);

  readonly features = [
    { icon: 'bi-calendar2-week', color: 'primary', title: 'Lịch tập', text: 'Tạo lịch tập theo ngày, sắp xếp bài, đặt mục tiêu set/reps/kg và thời gian nghỉ.' },
    { icon: 'bi-journal-bookmark', color: 'success', title: 'Thư viện bài tập', text: 'Hơn 20 bài tập theo nhóm cơ với hướng dẫn từng bước và lưu ý kỹ thuật.' },
    { icon: 'bi-heart-pulse', color: 'danger', title: 'Chỉ số sức khỏe', text: 'Ghi lại cân nặng, BMI, vòng eo, % mỡ và khối lượng cơ theo thời gian.' },
    { icon: 'bi-graph-up-arrow', color: 'warning', title: 'Thống kê tiến trình', text: 'Biểu đồ trực quan giúp bạn thấy rõ sự tiến bộ sau mỗi tuần tập luyện.' },
  ];

  ngOnInit(): void {
    this.exerciseService.getExercises().subscribe({
      next: (list) => this.exercises.set(list.filter((_, i) => i % 4 === 0).slice(0, 6)),
      error: () => this.exercises.set([]),
    });
  }
}

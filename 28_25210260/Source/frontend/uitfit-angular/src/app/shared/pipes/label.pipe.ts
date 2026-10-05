import { Pipe, PipeTransform } from '@angular/core';

export type LabelType = 'muscle' | 'difficulty' | 'planStatus' | 'sessionStatus' | 'goal' | 'gender' | 'role' | 'userStatus';

/** Nhãn hiển thị tiếng Việt cho các giá trị enum từ API */
export const LABELS: Record<LabelType, Record<string, string>> = {
  muscle: {
    chest: 'Ngực', back: 'Lưng', shoulders: 'Vai', legs: 'Chân', arms: 'Tay', core: 'Core', cardio: 'Cardio',
  },
  difficulty: { beginner: 'Cơ bản', intermediate: 'Trung bình', advanced: 'Nâng cao' },
  planStatus: {
    draft: 'Chưa bắt đầu', scheduled: 'Đã lên lịch', in_progress: 'Đang thực hiện',
    completed: 'Đã hoàn thành', cancelled: 'Đã hủy',
  },
  sessionStatus: { in_progress: 'Đang tập', completed: 'Hoàn thành', cancelled: 'Đã hủy' },
  goal: {
    lose_weight: 'Giảm cân', gain_muscle: 'Tăng cơ', maintain: 'Duy trì vóc dáng', general_fitness: 'Nâng cao sức khỏe',
  },
  gender: { male: 'Nam', female: 'Nữ', other: 'Khác' },
  role: { user: 'Người dùng', admin: 'Quản trị viên' },
  userStatus: { active: 'Hoạt động', locked: 'Đã khóa' },
};

/** Màu badge Bootstrap tương ứng trạng thái */
export const BADGE: Record<string, string> = {
  draft: 'secondary', scheduled: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger',
  active: 'success', locked: 'danger',
  beginner: 'success', intermediate: 'warning', advanced: 'danger',
};

export function optionsOf(type: LabelType): { value: string; label: string }[] {
  return Object.entries(LABELS[type]).map(([value, label]) => ({ value, label }));
}

@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined, type: LabelType): string {
    if (!value) return '—';
    return LABELS[type][value] ?? value;
  }
}

@Pipe({ name: 'badge' })
export class BadgePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return `badge-soft-${BADGE[value ?? ''] ?? 'secondary'}`;
  }
}

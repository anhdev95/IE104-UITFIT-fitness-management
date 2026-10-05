import { Pipe, PipeTransform } from '@angular/core';

/**
 * Định dạng số giây:
 *  - 'clock' → 01:05:09 / 05:09
 *  - 'short' → 1 giờ 5 phút / 25 phút / 45 giây
 */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined, format: 'clock' | 'short' = 'short'): string {
    const total = Math.max(0, Math.floor(seconds ?? 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (format === 'clock') {
      const pad = (n: number) => String(n).padStart(2, '0');
      return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }
    if (h > 0) return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
    if (m > 0) return `${m} phút`;
    return `${s} giây`;
  }
}

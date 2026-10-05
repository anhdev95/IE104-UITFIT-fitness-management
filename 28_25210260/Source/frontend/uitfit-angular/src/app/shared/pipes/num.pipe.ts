import { formatNumber } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/** Định dạng số theo locale (vi: 70,5) — null/undefined hiển thị "—" */
@Pipe({ name: 'num' })
export class NumPipe implements PipeTransform {
  private locale = inject(LOCALE_ID);

  transform(value: number | null | undefined, digits = '1.0-1'): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
    return formatNumber(Number(value), this.locale, digits);
  }
}

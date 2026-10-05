import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BmiCategory, HealthRecord, HealthRecordPayload } from '../models/health-record.model';
import { unwrap } from './api.helpers';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getRecords(): Observable<HealthRecord[]> {
    return this.http.get<ApiResponse<HealthRecord[]>>(`${this.api}/health-records`).pipe(unwrap());
  }

  getRecord(id: number): Observable<HealthRecord> {
    return this.http.get<ApiResponse<HealthRecord>>(`${this.api}/health-records/${id}`).pipe(unwrap());
  }

  createRecord(payload: HealthRecordPayload): Observable<HealthRecord> {
    return this.http.post<ApiResponse<HealthRecord>>(`${this.api}/health-records`, payload).pipe(unwrap());
  }

  deleteRecord(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.api}/health-records/${id}`);
  }

  /** Chỉ dùng để PREVIEW trên giao diện — giá trị lưu do Laravel tính lại */
  static previewBmi(weight: number | null, heightCm: number | null): number | null {
    if (!weight || !heightCm || weight <= 0 || heightCm <= 0) return null;
    const m = heightCm / 100;
    return Math.round((weight / (m * m)) * 100) / 100;
  }

  static bmiCategory(bmi: number | null): BmiCategory | null {
    if (!bmi) return null;
    if (bmi < 18.5) return { key: 'underweight', label: 'Thiếu cân' };
    if (bmi < 25) return { key: 'normal', label: 'Bình thường' };
    if (bmi < 30) return { key: 'overweight', label: 'Thừa cân' };
    return { key: 'obese', label: 'Béo phì' };
  }
}

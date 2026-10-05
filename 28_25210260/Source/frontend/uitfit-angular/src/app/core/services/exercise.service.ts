import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Exercise, ExerciseFilter, ExercisePayload } from '../models/exercise.model';
import { toParams, unwrap } from './api.helpers';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  /* ---------- User / public ---------- */

  getExercises(filter: ExerciseFilter = {}): Observable<Exercise[]> {
    return this.http
      .get<ApiResponse<Exercise[]>>(`${this.api}/exercises`, { params: toParams(filter) })
      .pipe(unwrap());
  }

  getExercise(id: number): Observable<Exercise> {
    return this.http.get<ApiResponse<Exercise>>(`${this.api}/exercises/${id}`).pipe(unwrap());
  }

  /* ---------- Admin ---------- */

  adminList(filter: ExerciseFilter = {}): Observable<Exercise[]> {
    return this.http
      .get<ApiResponse<Exercise[]>>(`${this.api}/admin/exercises`, { params: toParams(filter) })
      .pipe(unwrap());
  }

  adminGet(id: number): Observable<Exercise> {
    return this.http.get<ApiResponse<Exercise>>(`${this.api}/admin/exercises/${id}`).pipe(unwrap());
  }

  adminCreate(payload: ExercisePayload, imageFile?: File | null): Observable<Exercise> {
    return this.http
      .post<ApiResponse<Exercise>>(`${this.api}/admin/exercises`, this.toFormData(payload, imageFile))
      .pipe(unwrap());
  }

  /** Gửi multipart qua POST + _method=PUT để Laravel nhận được file */
  adminUpdate(id: number, payload: ExercisePayload, imageFile?: File | null): Observable<Exercise> {
    const form = this.toFormData(payload, imageFile);
    form.append('_method', 'PUT');
    return this.http.post<ApiResponse<Exercise>>(`${this.api}/admin/exercises/${id}`, form).pipe(unwrap());
  }

  adminDelete(id: number): Observable<ApiResponse<Exercise | null>> {
    return this.http.delete<ApiResponse<Exercise | null>>(`${this.api}/admin/exercises/${id}`);
  }

  private toFormData(payload: ExercisePayload, imageFile?: File | null): FormData {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) form.append(key, String(value));
    });
    if (imageFile) form.append('image_file', imageFile);
    return form;
  }
}

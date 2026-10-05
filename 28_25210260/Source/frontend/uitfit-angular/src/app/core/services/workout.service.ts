import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PlanTab, WorkoutPlan, WorkoutPlanPayload } from '../models/workout-plan.model';
import { HistoryFilter, WorkoutSession } from '../models/workout-session.model';
import { WorkoutSet, WorkoutSetPayload } from '../models/workout-set.model';
import { toParams, unwrap } from './api.helpers';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  /* ---------- Workout Plan (kế hoạch) ---------- */

  getPlans(status: PlanTab = 'all', search = ''): Observable<WorkoutPlan[]> {
    return this.http
      .get<ApiResponse<WorkoutPlan[]>>(`${this.api}/workout-plans`, { params: toParams({ status, search }) })
      .pipe(unwrap());
  }

  getPlan(id: number): Observable<WorkoutPlan> {
    return this.http.get<ApiResponse<WorkoutPlan>>(`${this.api}/workout-plans/${id}`).pipe(unwrap());
  }

  createPlan(payload: WorkoutPlanPayload): Observable<WorkoutPlan> {
    return this.http.post<ApiResponse<WorkoutPlan>>(`${this.api}/workout-plans`, payload).pipe(unwrap());
  }

  updatePlan(id: number, payload: WorkoutPlanPayload): Observable<WorkoutPlan> {
    return this.http.put<ApiResponse<WorkoutPlan>>(`${this.api}/workout-plans/${id}`, payload).pipe(unwrap());
  }

  deletePlan(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.api}/workout-plans/${id}`);
  }

  /* ---------- Workout Session (lần tập thực tế) ---------- */

  /** Bắt đầu (hoặc tiếp tục) buổi tập từ lịch tập */
  startSession(planId: number): Observable<WorkoutSession> {
    return this.http.post<ApiResponse<WorkoutSession>>(`${this.api}/workout-plans/${planId}/start`, {}).pipe(unwrap());
  }

  getSession(id: number): Observable<WorkoutSession> {
    return this.http.get<ApiResponse<WorkoutSession>>(`${this.api}/workout-sessions/${id}`).pipe(unwrap());
  }

  addSet(sessionId: number, exerciseId: number): Observable<WorkoutSet> {
    return this.http
      .post<ApiResponse<WorkoutSet>>(`${this.api}/workout-sessions/${sessionId}/sets`, { exercise_id: exerciseId })
      .pipe(unwrap());
  }

  updateSet(setId: number, payload: WorkoutSetPayload): Observable<WorkoutSet> {
    return this.http.put<ApiResponse<WorkoutSet>>(`${this.api}/workout-sets/${setId}`, payload).pipe(unwrap());
  }

  deleteSet(setId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.api}/workout-sets/${setId}`);
  }

  completeSession(id: number, note: string | null): Observable<WorkoutSession> {
    return this.http
      .post<ApiResponse<WorkoutSession>>(`${this.api}/workout-sessions/${id}/complete`, { note })
      .pipe(unwrap());
  }

  cancelSession(id: number): Observable<WorkoutSession> {
    return this.http.post<ApiResponse<WorkoutSession>>(`${this.api}/workout-sessions/${id}/cancel`, {}).pipe(unwrap());
  }

  getHistory(filter: HistoryFilter = {}): Observable<WorkoutSession[]> {
    return this.http
      .get<ApiResponse<WorkoutSession[]>>(`${this.api}/workout-history`, { params: toParams(filter) })
      .pipe(unwrap());
  }
}

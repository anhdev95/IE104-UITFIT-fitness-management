import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { WorkoutStatistics } from '../models/dashboard.model';
import { HealthRange, HealthStatistics } from '../models/health-record.model';
import { unwrap } from './api.helpers';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getHealth(range: HealthRange): Observable<HealthStatistics> {
    return this.http
      .get<ApiResponse<HealthStatistics>>(`${this.api}/statistics/health`, { params: { range } })
      .pipe(unwrap());
  }

  getWorkouts(): Observable<WorkoutStatistics> {
    return this.http.get<ApiResponse<WorkoutStatistics>>(`${this.api}/statistics/workouts`).pipe(unwrap());
  }
}

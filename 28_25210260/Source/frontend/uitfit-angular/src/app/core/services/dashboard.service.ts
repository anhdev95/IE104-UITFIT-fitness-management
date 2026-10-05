import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AdminDashboard, UserDashboard } from '../models/dashboard.model';
import { unwrap } from './api.helpers';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getUserDashboard(): Observable<UserDashboard> {
    return this.http.get<ApiResponse<UserDashboard>>(`${this.api}/dashboard`).pipe(unwrap());
  }

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<ApiResponse<AdminDashboard>>(`${this.api}/admin/dashboard`).pipe(unwrap());
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HealthRecord } from '../models/health-record.model';
import { User, UserStatus } from '../models/user.model';
import { toParams, unwrap } from './api.helpers';

export interface AdminUserDetail {
  user: User;
  latest_health: HealthRecord | null;
  completed_sessions: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getUsers(filter: { search?: string; role?: string; status?: string } = {}): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.api}/admin/users`, { params: toParams(filter) })
      .pipe(unwrap());
  }

  getUser(id: number): Observable<AdminUserDetail> {
    return this.http.get<ApiResponse<AdminUserDetail>>(`${this.api}/admin/users/${id}`).pipe(unwrap());
  }

  updateStatus(id: number, status: UserStatus): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.api}/admin/users/${id}/status`, { status });
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ChangePasswordPayload, ProfilePayload, User } from '../models/user.model';
import { unwrap } from './api.helpers';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = environment.apiUrl;

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.api}/profile`).pipe(unwrap());
  }

  updateProfile(payload: ProfilePayload): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.api}/profile`, payload)
      .pipe(unwrap(), tap((u) => this.auth.setUser(u)));
  }

  uploadAvatar(file: File): Observable<User> {
    const form = new FormData();
    form.append('avatar', file);
    return this.http
      .post<ApiResponse<User>>(`${this.api}/profile/avatar`, form)
      .pipe(unwrap(), tap((u) => this.auth.setUser(u)));
  }

  changePassword(payload: ChangePasswordPayload): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.api}/profile/password`, payload);
  }
}

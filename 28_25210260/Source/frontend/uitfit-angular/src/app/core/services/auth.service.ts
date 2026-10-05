import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthResult, RegisterPayload, User } from '../models/user.model';
import { unwrap } from './api.helpers';

const TOKEN_KEY = 'uitfit_token';
const USER_KEY = 'uitfit_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  private readonly _user = signal<User | null>(this.readUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user() && !!this.token);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  /** "Ghi nhớ đăng nhập" → localStorage, ngược lại sessionStorage (mất khi đóng trình duyệt) */
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string, remember: boolean): Observable<AuthResult> {
    return this.http
      .post<ApiResponse<AuthResult>>(`${this.api}/login`, { email, password, remember })
      .pipe(unwrap(), tap((res) => this.saveSession(res, remember)));
  }

  register(payload: RegisterPayload): Observable<AuthResult> {
    return this.http
      .post<ApiResponse<AuthResult>>(`${this.api}/register`, payload)
      .pipe(unwrap(), tap((res) => this.saveSession(res, true)));
  }

  me(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.api}/me`).pipe(unwrap(), tap((u) => this.setUser(u)));
  }

  logout(): void {
    if (this.token) {
      this.http.post(`${this.api}/logout`, {}).subscribe({ error: () => undefined });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Xóa phiên local (dùng khi nhận 401) */
  clearSession(): void {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
    this._user.set(null);
  }

  /** Trang chủ theo vai trò */
  homeUrl(): string {
    return this.isAdmin() ? '/admin/dashboard' : '/dashboard';
  }

  setUser(user: User): void {
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private saveSession(res: AuthResult, remember: boolean): void {
    this.clearSession();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, res.token);
    storage.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}

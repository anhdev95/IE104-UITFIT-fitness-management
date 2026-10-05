import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import { AdminUserDetail, AdminUserService } from '../../../core/services/admin-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { BadgePipe, LabelPipe } from '../../../shared/pipes/label.pipe';
import { NumPipe } from '../../../shared/pipes/num.pipe';

@Component({
  selector: 'app-admin-users',
  imports: [NumPipe, FormsModule, DatePipe, LabelPipe, BadgePipe, LoadingComponent, EmptyStateComponent],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(AdminUserService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly detail = signal<AdminUserDetail | null>(null);
  filter = { search: '', role: '', status: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.getUsers(this.filter).subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  view(u: User): void {
    this.userService.getUser(u.id).subscribe((d) => this.detail.set(d));
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();
  }

  async toggleLock(u: User): Promise<void> {
    const locking = u.status === 'active';
    const ok = await this.confirm.confirm({
      title: locking ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?',
      message: locking
        ? `${u.name} sẽ bị đăng xuất và không thể đăng nhập cho đến khi được mở khóa.`
        : `${u.name} sẽ có thể đăng nhập lại vào UITfit.`,
      confirmText: locking ? 'Khóa' : 'Mở khóa',
      variant: locking ? 'danger' : 'success',
      icon: locking ? 'bi-lock' : 'bi-unlock',
    });
    if (!ok) return;
    this.userService.updateStatus(u.id, locking ? 'locked' : 'active').subscribe((res) => {
      this.toast.success(res.message);
      this.users.update((list) => list.map((x) => (x.id === u.id ? { ...x, status: res.data.status } : x)));
      const d = this.detail();
      if (d?.user.id === u.id) this.detail.set({ ...d, user: { ...d.user, status: res.data.status } });
    });
  }
}
